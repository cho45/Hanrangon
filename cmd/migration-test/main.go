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

	"github.com/cho45/hanrangon/backend/formatter"
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

		newFormatted, err := formatter.Format(body, fType)
		if err != nil {
			fmt.Printf("ID %d [%s]: ERROR: %v\n", eid, fType, err)
		}

		na := NormalizeHTML(oldFormatted, fType)
		nb := NormalizeHTML(newFormatted, fType)

		if na == nb {
			passed++
			if *verboseFlag || *idFlag != 0 {
				fmt.Printf("ID %d [%s]: PASS\n", eid, fType)
			}
		} else {
			fmt.Printf("ID %d [%s]: FAIL\n", eid, fType)
			if *idFlag != 0 || *verboseFlag {
				fmt.Printf("  OLD NORM: %s\n", na)
				fmt.Printf("  NEW NORM: %s\n", nb)
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

func NormalizeHTML(input string, format string) string {
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

	canonicalize(body, format)

	var buf bytes.Buffer
	for c := body.FirstChild; c != nil; c = c.NextSibling {
		_ = html.Render(&buf, c)
	}
	return strings.TrimSpace(buf.String())
}

func canonicalize(n *html.Node, format string) {
	if n.Type == html.ElementNode {
		if format == "Hatena" {
			// 1. Remove footnotes completely
			if n.Data == "div" {
				for _, attr := range n.Attr {
					if attr.Key == "class" && attr.Val == "footnotes" {
						removeNode(n)
						return
					}
				}
			}

			// 2. Normalize Amazon/Figure cards to simple placeholder
			if n.Data == "figure" {
				isCard := false
				for _, attr := range n.Attr {
					if attr.Key == "class" && (attr.Val == "amazon" || attr.Val == "http") {
						isCard = true
						break
					}
				}
				if isCard {
					n.Data = "span"
					n.Attr = []html.Attribute{{Key: "class", Val: "card-placeholder"}}
					n.FirstChild = &html.Node{Type: html.TextNode, Data: "[CARD]"}
					n.LastChild = n.FirstChild
					// If inside P, move out
					if n.Parent != nil && n.Parent.Data == "p" {
						moveCardOutOfP(n.Parent, n)
						return
					}
				}
			}

			// 3. Normalize ASIN links to match normalized card
			if n.Data == "a" {
				if n.FirstChild != nil && n.FirstChild.Type == html.TextNode && strings.HasPrefix(n.FirstChild.Data, "asin:") {
					n.Data = "span"
					n.Attr = []html.Attribute{{Key: "class", Val: "card-placeholder"}}
					n.FirstChild.Data = "[CARD]"
					// If inside P, move out
					if n.Parent != nil && n.Parent.Data == "p" {
						moveCardOutOfP(n.Parent, n)
						return
					}
				}
			}

			// 4. Normalize Fotolife
			if n.Data == "a" {
				for i := range n.Attr {
					if n.Attr[i].Key == "class" && n.Attr[i].Val == "hatena-fotolife" {
						for j := range n.Attr {
							if n.Attr[j].Key == "href" {
								n.Attr[j].Val = "#fotolife-placeholder"
							}
						}
					}
				}
			}
			if n.Data == "img" {
				isFotolife := false
				for _, attr := range n.Attr {
					if attr.Key == "class" && attr.Val == "hatena-fotolife" {
						isFotolife = true
						break
					}
				}
				if isFotolife {
					for j := range n.Attr {
						if n.Attr[j].Key == "src" {
							n.Attr[j].Val = strings.Replace(n.Attr[j].Val, "http://", "https://", 1)
						}
					}
				}
			}

			// 5. Cleanup empty P tags (common artifacts)
			if n.Data == "p" && isEmptyOrWhitespaceOnly(n) {
				removeNode(n)
				return
			}
		}

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
	for c := n.FirstChild; c != nil; {
		next := c.NextSibling
		canonicalize(c, format)
		c = next
	}
}

func moveCardOutOfP(p *html.Node, card *html.Node) {
	parent := p.Parent
	if parent == nil {
		return
	}

	// Create a new P for the part after the card
	afterP := &html.Node{Type: html.ElementNode, Data: "p"}
	for c := card.NextSibling; c != nil; {
		next := c.NextSibling
		p.RemoveChild(c)
		afterP.AppendChild(c)
		c = next
	}

	// Move the card out of the P and place it after the original P
	p.RemoveChild(card)
	parent.InsertBefore(card, p.NextSibling)

	// Insert the new P after the card ONLY if it has significant content
	if !isEmptyOrWhitespaceOnly(afterP) {
		parent.InsertBefore(afterP, card.NextSibling)
	}

	// Clean up original P if now empty
	if isEmptyOrWhitespaceOnly(p) {
		removeNode(p)
	}
}

func removeNode(n *html.Node) {
	if n.Parent != nil {
		n.Parent.RemoveChild(n)
	}
}

func isEmptyOrWhitespaceOnly(n *html.Node) bool {
	if n == nil {
		return true
	}
	if n.FirstChild == nil {
		return true
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if c.Type == html.ElementNode {
			return false
		}
		if c.Type == html.TextNode && strings.TrimSpace(c.Data) != "" {
			return false
		}
	}
	return true
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
			if _, err := fmt.Sscanf(parts[0], "%d", &id); err == nil && id != 0 {
				m[id] = line
			}
		}
	}
	return m
}
