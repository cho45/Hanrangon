package main

import (
	"bufio"
	"bytes"
	"database/sql"
	"flag"
	"fmt"
	"log"
	"os"
	"sort"
	"strings"

	"github.com/cho45/hanrangon/formatter"
	_ "github.com/mattn/go-sqlite3"
	"github.com/sergi/go-diff/diffmatchpatch"
	"golang.org/x/net/html"
)

var (
	idFlag      = flag.Int64("id", 0, "Test a single entry ID")
	formatFlag  = flag.String("format", "", "Filter by format")
	verboseFlag = flag.Bool("v", false, "Show detailed diff info")
)

func main() {
	flag.Parse()

	ignoreMap := loadIgnoreMap("cmd/migration-test/error-ignore.txt")

	db, err := sql.Open("sqlite3", "var/db/data.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	query := "SELECT id, format, body, formatted_body FROM entries WHERE 1=1"
	var args []interface{}

	if *idFlag != 0 {
		query += " AND id = ?"
		args = append(args, *idFlag)
	}
	if *formatFlag != "" {
		query += " AND format = ?"
		args = append(args, *formatFlag)
	}
	query += " ORDER BY id ASC"

	rows, err := db.Query(query, args...)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	dmp := diffmatchpatch.New()
	total := 0
	passed := 0

	for rows.Next() {
		var eid int64
		var fType, body, oldFormatted string
		if err := rows.Scan(&eid, &fType, &body, &oldFormatted); err != nil {
			continue
		}

		total++

		if _, ok := ignoreMap[eid]; ok && *idFlag == 0 {
			fmt.Printf("ID %d [%s]: IGNORE\n", eid, fType)
			passed++
			continue
		}

		newFormatted, _ := formatter.Format(body, fType)

		na := NormalizeHTML(oldFormatted)
		nb := NormalizeHTML(newFormatted)

		if na == nb {
			passed++
			if *verboseFlag || *idFlag != 0 {
				fmt.Printf("ID %d [%s]: PASS\n", eid, fType)
			}
		} else {
			fmt.Printf("ID %d [%s]: FAIL\n", eid, fType)
			if *idFlag != 0 || *verboseFlag {
				diffs := dmp.DiffMain(na, nb, false)
				for _, d := range diffs {
					switch d.Type {
					case diffmatchpatch.DiffInsert:
						fmt.Printf(" [NEW: %s] ", d.Text)
					case diffmatchpatch.DiffDelete:
						fmt.Printf(" [OLD: %s] ", d.Text)
					case diffmatchpatch.DiffEqual:
						fmt.Print(d.Text)
					}
				}
				fmt.Println("\n-------------------")
			}
		}
	}

	fmt.Printf("\nSummary: %d/%d passed (%.2f%%)\n", passed, total, float64(passed)/float64(total)*100)
	if passed < total && *idFlag != 0 {
		os.Exit(1)
	}
}

func NormalizeHTML(input string) string {
	doc, err := html.Parse(strings.NewReader(input))
	if err != nil {
		return input
	}

	var body *html.Node
	var f func(*html.Node)
	f = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "body" {
			body = n
			return
		}
		for c := n.FirstChild; c != nil && body == nil; c = c.NextSibling {
			f(c)
		}
	}
	f(doc)

	if body == nil {
		return input
	}

	canonicalize(body)

	var buf bytes.Buffer
	for c := body.FirstChild; c != nil; c = c.NextSibling {
		html.Render(&buf, c)
	}
	return strings.TrimSpace(buf.String())
}

func canonicalize(n *html.Node) {
	if n.Type == html.ElementNode {
		sort.Slice(n.Attr, func(i, j int) bool {
			return n.Attr[i].Key < n.Attr[j].Key
		})
		for i := range n.Attr {
			if n.Attr[i].Key == "style" {
				v := strings.ToLower(n.Attr[i].Val)
				v = strings.ReplaceAll(v, " ", "")
				v = strings.TrimSuffix(v, ";")
				v = strings.ReplaceAll(v, "black", "#000")
				v = strings.ReplaceAll(v, "rgb(255,255,102)", "#ff6")
				n.Attr[i].Val = v
			}
		}
	}
	if n.Type == html.TextNode {
		n.Data = strings.Join(strings.Fields(html.UnescapeString(n.Data)), " ")
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		canonicalize(c)
	}
}

func loadIgnoreMap(path string) map[int64]string {
	m := make(map[int64]string)
	f, err := os.Open(path)
	if err != nil {
		return m
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := scanner.Text()
		parts := strings.SplitN(line, ":", 2)
		if len(parts) > 0 {
			var id int64
			fmt.Sscanf(parts[0], "%d", &id)
			if id != 0 {
				m[id] = line
			}
		}
	}
	return m
}
