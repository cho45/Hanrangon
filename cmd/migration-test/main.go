package main

import (
	"bytes"
	"database/sql"
	"flag"
	"fmt"
	"log"
	"sort"
	"strings"

	"github.com/cho45/hanrangon/formatter"
	_ "github.com/mattn/go-sqlite3"
	"github.com/sergi/go-diff/diffmatchpatch"
	"golang.org/x/net/html"
)

func main() {
	id := flag.Int64("id", 0, "Test a single entry ID")
	startID := flag.Int64("start", 0, "Start entry ID")
	endID := flag.Int64("end", 0, "End entry ID")
	formatFilter := flag.String("format", "", "Filter by format (HTML, Hatena, tDiary, Markdown)")
	verbose := flag.Bool("v", false, "Show detailed diff on failure")
	flag.Parse()

	db, err := sql.Open("sqlite3", "var/db/data.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	query := "SELECT id, format, body, formatted_body FROM entries WHERE 1=1"
	var args []interface{}

	if *id != 0 {
		query += " AND id = ?"
		args = append(args, *id)
	} else {
		if *startID != 0 {
			query += " AND id >= ?"
			args = append(args, *startID)
		}
		if *endID != 0 {
			query += " AND id <= ?"
			args = append(args, *endID)
		}
	}

	if *formatFilter != "" {
		query += " AND format = ?"
		args = append(args, *formatFilter)
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
			log.Printf("Scan error ID %d: %v", eid, err)
			continue
		}

		total++
		newFormatted, err := formatter.Format(body, fType)
		if err != nil {
			fmt.Printf("ID %d [%s]: ERROR: %v\n", eid, fType, err)
			continue
		}

		na := NormalizeHTML(oldFormatted)
		nb := NormalizeHTML(newFormatted)

		if na == nb {
			passed++
			if *verbose {
				fmt.Printf("ID %d [%s]: PASS\n", eid, fType)
			}
		} else {
			fmt.Printf("ID %d [%s]: FAIL\n", eid, fType)
			if *id != 0 || *verbose {
				fmt.Println("--- OLD NORM ---")
				fmt.Println(na)
				fmt.Println("--- NEW NORM ---")
				fmt.Println(nb)
				diffs := dmp.DiffMain(na, nb, false)
				fmt.Println("--- DIFF ---")
				fmt.Println(dmp.DiffText1(diffs))
				fmt.Println("----------")
				fmt.Println(dmp.DiffText2(diffs))
			}
		}
	}

	fmt.Printf("\nSummary: %d/%d passed (%.2f%%)\n", passed, total, float64(passed)/float64(total)*100)
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
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			f(c)
		}
	}
	f(doc)

	if body == nil {
		return input
	}

	var buf bytes.Buffer
	for c := body.FirstChild; c != nil; {
		next := c.NextSibling
		if ok := simplify(c); ok {
			html.Render(&buf, c)
		}
		c = next
	}

	return strings.TrimSpace(buf.String())
}

func simplify(n *html.Node) bool {
	if n.Type == html.CommentNode {
		// Remove comments
		return false
	}

	if n.Type == html.ElementNode {
		sort.Slice(n.Attr, func(i, j int) bool {
			return n.Attr[i].Key < n.Attr[j].Key
		})
		for i := range n.Attr {
			if n.Attr[i].Key == "style" {
				v := strings.ReplaceAll(n.Attr[i].Val, " ", "")
				v = strings.TrimSuffix(v, ";")
				n.Attr[i].Val = v
			}
		}
	} else if n.Type == html.TextNode {
		// Unescape to normalize entity references (like &#65393; vs ｱ)
		raw := html.UnescapeString(n.Data)
		n.Data = strings.Join(strings.Fields(raw), " ")
	}

	for c := n.FirstChild; c != nil; {
		next := c.NextSibling
		if ok := simplify(c); !ok {
			n.RemoveChild(c)
		}
		c = next
	}

	// Remove empty text nodes after normalization
	if n.Type == html.TextNode && n.Data == "" {
		return false
	}

	return true
}
