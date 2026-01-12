package subcommands

import (
	"bufio"
	"context"
	"database/sql"
	"net"
	"net/textproto"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"github.com/cho45/hanrangon/backend/app"
	_ "github.com/mattn/go-sqlite3"
)

// Simple Mock SMTP Server for testing
type mockSMTPServer struct {
	addr     string
	listener net.Listener
	received chan string
	err      chan error
}

func startMockSMTPServer(t *testing.T) *mockSMTPServer {
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("failed to listen: %v", err)
	}

	s := &mockSMTPServer{
		addr:     l.Addr().String(),
		listener: l,
		received: make(chan string, 1),
		err:      make(chan error, 1),
	}

	go func() {
		defer l.Close()
		conn, err := l.Accept()
		if err != nil {
			return
		}
		defer conn.Close()

		reader := bufio.NewReader(conn)
		tp := textproto.NewReader(reader)
		writer := textproto.NewWriter(bufio.NewWriter(conn))

		writer.PrintfLine("220 localhost ESMTP")

		for {
			line, err := tp.ReadLine()
			if err != nil {
				break
			}

			if strings.HasPrefix(line, "HELO") || strings.HasPrefix(line, "EHLO") {
				writer.PrintfLine("250-localhost")
				writer.PrintfLine("250 SIZE 1024000")
			} else if strings.HasPrefix(line, "MAIL FROM") || strings.HasPrefix(line, "RCPT TO") {
				writer.PrintfLine("250 OK")
			} else if line == "DATA" {
				writer.PrintfLine("354 Start mail input; end with <CRLF>.<CRLF>")
				data, err := tp.ReadDotLines()
				if err != nil {
					s.err <- err
					return
				}
				s.received <- strings.Join(data, "\n")
				writer.PrintfLine("250 OK")
			} else if line == "QUIT" {
				writer.PrintfLine("221 Goodbye")
				return
			}
		}
	}()

	return s
}

type mockApp struct {
	app.App
	config *app.Config
	db     *sql.DB
}

func (m *mockApp) Config() *app.Config { return m.config }
func (m *mockApp) DB() *sql.DB         { return m.db }

func TestBackup(t *testing.T) {
	// Check for xz command
	if _, err := exec.LookPath("xz"); err != nil {
		t.Skip("xz command not found, skipping backup test")
	}

	// 1. Setup Mock DB
	tempDir, err := os.MkdirTemp("", "hanrangon-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "data.db")
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	defer db.Close()

	_, err = db.Exec("CREATE TABLE entries (id INTEGER PRIMARY KEY, title TEXT)")
	if err != nil {
		t.Fatalf("failed to create table: %v", err)
	}
	_, err = db.Exec("INSERT INTO entries (title) VALUES ('Test Entry')")
	if err != nil {
		t.Fatalf("failed to insert data: %v", err)
	}

	// 2. Start Mock SMTP
	smtpServer := startMockSMTPServer(t)
	defer smtpServer.listener.Close()

	// 3. Run Backup
	config := app.LoadConfig()
	config.DataDBPath = dbPath

	application := &mockApp{
		config: config,
		db:     db,
	}

	err = Backup(context.Background(), application, []string{"-smtp", smtpServer.addr})
	if err != nil {
		t.Fatalf("Backup failed: %v", err)
	}

	// 4. Verify received email
	select {
	case email := <-smtpServer.received:
		if !strings.Contains(email, "Subject: Backup") {
			t.Errorf("Email subject missing: %s", email)
		}
		if !strings.Contains(email, "Content-Type: multipart/mixed") {
			t.Errorf("Email content type incorrect: %s", email)
		}
		if !strings.Contains(email, "Content-Transfer-Encoding: base64") {
			t.Errorf("Email missing base64 attachment: %s", email)
		}
		t.Log("Successfully verified backup email content")
	case err := <-smtpServer.err:
		t.Fatalf("SMTP server error: %v", err)
	}
}
