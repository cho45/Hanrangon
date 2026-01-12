package subcommands

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/base64"
	"flag"
	"fmt"
	"log"
	"mime/multipart"
	"net"
	"net/smtp"
	"net/textproto"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/cho45/hanrangon/app"
)

func Backup(ctx context.Context, application app.App, args []string) error {
	fs := flag.NewFlagSet("backup", flag.ExitOnError)
	smtpAddr := fs.String("smtp", "localhost:25", "SMTP server address")
	smtpInsecure := fs.Bool("insecure", false, "Skip TLS verification for SMTP")
	fs.Parse(args)

	config := application.Config()
	dbPath := config.DataDBPath

	// 1. Create a safe backup using VACUUM INTO
	log.Printf("Creating a safe backup of %s...", dbPath)
	tempDB := filepath.Join(os.TempDir(), fmt.Sprintf("hanrangon-backup-%d.db", time.Now().Unix()))
	defer os.Remove(tempDB)

	_, err := application.DB().ExecContext(ctx, fmt.Sprintf("VACUUM INTO '%s'", tempDB))
	if err != nil {
		return fmt.Errorf("failed to vacuum DB: %w", err)
	}

	// 2. Compress using xz
	log.Printf("Compressing backup...")
	compressedFile := tempDB + ".xz"
	defer os.Remove(compressedFile)

	cmd := exec.CommandContext(ctx, "xz", "-z", "-9", "-k", "-f", tempDB)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to compress with xz: %w", err)
	}

	// 3. Prepare Email
	log.Printf("Preparing backup email...")
	now := time.Now()
	// Human readable format: YYYYMMDD-HHMMSS
	timestamp := now.Format("20060102-150405")
	filename := timestamp + "-data.db.xz"

	from := "cho45@lowreal.net"
	to := "cho45@lowreal.net"
	subject := fmt.Sprintf("Backup %s", filename)

	content, err := os.ReadFile(compressedFile)
	if err != nil {
		return fmt.Errorf("failed to read compressed file: %w", err)
	}

	// Construct MIME message
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	// Header
	fmt.Fprintf(&body, "From: %s\r\n", from)
	fmt.Fprintf(&body, "To: %s\r\n", to)
	fmt.Fprintf(&body, "Subject: %s\r\n", subject)
	fmt.Fprintf(&body, "MIME-Version: 1.0\r\n")
	fmt.Fprintf(&body, "Content-Type: multipart/mixed; boundary=%s\r\n", writer.Boundary())
	fmt.Fprintf(&body, "\r\n")

	// Text part
	textPart, _ := writer.CreatePart(textproto.MIMEHeader{
		"Content-Type": []string{"text/plain; charset=UTF-8"},
	})
	fmt.Fprintf(textPart, "Backup of %s on %s", dbPath, now.Format("2006-01-02 15:04:05"))
	// Attachment part
	header := make(textproto.MIMEHeader)
	header.Set("Content-Type", "application/x-xz")
	header.Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	header.Set("Content-Transfer-Encoding", "base64")

	attachmentPart, _ := writer.CreatePart(header)
	encoder := base64.NewEncoder(base64.StdEncoding, attachmentPart)
	if _, err := encoder.Write(content); err != nil {
		return err
	}
	if err := encoder.Close(); err != nil {
		return err
	}

	if err := writer.Close(); err != nil {
		return err
	}

	// 4. Send Email
	log.Printf("Sending email to %s via %s...", to, *smtpAddr)
	// Using the provided smtp address with no authentication
	err = sendMail(*smtpAddr, nil, from, []string{to}, body.Bytes(), *smtpInsecure)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("Backup completed and sent successfully.")
	return nil
}

func sendMail(addr string, a smtp.Auth, from string, to []string, msg []byte, insecure bool) error {
	host, _, err := net.SplitHostPort(addr)
	if err != nil {
		return err
	}
	c, err := smtp.Dial(addr)
	if err != nil {
		return err
	}
	defer func() { _ = c.Close() }()
	if ok, _ := c.Extension("STARTTLS"); ok {
		config := &tls.Config{
			ServerName:         host,
			InsecureSkipVerify: insecure,
		}
		if err = c.StartTLS(config); err != nil {
			return err
		}
	}
	if a != nil {
		if ok, _ := c.Extension("AUTH"); ok {
			if err = c.Auth(a); err != nil {
				return err
			}
		}
	}
	if err = c.Mail(from); err != nil {
		return err
	}
	for _, addr := range to {
		if err = c.Rcpt(addr); err != nil {
			return err
		}
	}
	w, err := c.Data()
	if err != nil {
		return err
	}
	_, err = w.Write(msg)
	if err != nil {
		return err
	}
	err = w.Close()
	if err != nil {
		return err
	}
	return c.Quit()
}
