package subcommands

import (
	"context"
	"encoding/csv"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/internal/testutil"
)

func TestParseSubtechCSV_SplitSortAndPath(t *testing.T) {
	csvPath := filepath.Join(t.TempDir(), "subtech.csv")
	if err := writeSubtechCSV(csvPath, [][]string{
		{"date", "title", "body", "comment", "text"},
		{
			"2019-07-08",
			"",
			"",
			"",
			"*1562562166*later title\nlater body\n\n*1562550000*earlier title\nearlier body",
		},
		{
			"2019-07-09",
			"",
			"",
			"",
			"*1562640000*next day\nnext body",
		},
	}); err != nil {
		t.Fatal(err)
	}

	got, err := parseSubtechCSV(csvPath)
	if err != nil {
		t.Fatalf("parseSubtechCSV() error = %v", err)
	}
	if len(got) != 3 {
		t.Fatalf("len(got) = %d, want 3", len(got))
	}

	if got[0].Title != "earlier title" || got[0].Body != "earlier body" {
		t.Errorf("entry[0] = %#v, want earlier title/body", got[0])
	}
	if got[1].Title != "later title" || got[1].Body != "later body" {
		t.Errorf("entry[1] = %#v, want later title/body", got[1])
	}
	if got[2].Title != "next day" || got[2].Body != "next body" {
		t.Errorf("entry[2] = %#v, want next day/body", got[2])
	}

	if got[0].Path != "2019/07/08/1" {
		t.Errorf("entry[0].Path = %q, want %q", got[0].Path, "2019/07/08/1")
	}
	if got[1].Path != "2019/07/08/2" {
		t.Errorf("entry[1].Path = %q, want %q", got[1].Path, "2019/07/08/2")
	}
	if got[2].Path != "2019/07/09/1" {
		t.Errorf("entry[2].Path = %q, want %q", got[2].Path, "2019/07/09/1")
	}
}

func TestParseSubtechCSV_FallbackRowWithoutTimestamp(t *testing.T) {
	csvPath := filepath.Join(t.TempDir(), "subtech.csv")
	if err := writeSubtechCSV(csvPath, [][]string{
		{"date", "title", "body", "comment", "text"},
		{
			"2008-01-09",
			"",
			"",
			"",
			"><!--*fallback title\nfallback body\n--><",
		},
	}); err != nil {
		t.Fatal(err)
	}

	got, err := parseSubtechCSV(csvPath)
	if err != nil {
		t.Fatalf("parseSubtechCSV() error = %v", err)
	}
	if len(got) != 1 {
		t.Fatalf("len(got) = %d, want 1", len(got))
	}

	if got[0].Title != "fallback title" {
		t.Errorf("Title = %q, want %q", got[0].Title, "fallback title")
	}
	if got[0].Body != "fallback body" {
		t.Errorf("Body = %q, want %q", got[0].Body, "fallback body")
	}
	if got[0].Date != "2008-01-09" {
		t.Errorf("Date = %q, want %q", got[0].Date, "2008-01-09")
	}
	if got[0].Path != "2008/01/09/1" {
		t.Errorf("Path = %q, want %q", got[0].Path, "2008/01/09/1")
	}

	wantCreatedAt := time.Date(2008, 1, 9, 0, 0, 0, 0, app.APP_TZ)
	if !got[0].CreatedAt.Equal(wantCreatedAt) {
		t.Errorf("CreatedAt = %v, want %v", got[0].CreatedAt, wantCreatedAt)
	}
}

func TestParseSubtechTextSections_RobustTimestampSamples(t *testing.T) {
	t.Run("multiple sections with stars in body", func(t *testing.T) {
		text := `*1317126063*シリアライザ
** Storable

- 常に同じシリアライズ結果にできる
- 可読性なし

*1317043031*OSX のマウスの加速度がムカつく
>|c|
int main () {
	return 0;
}
||<`

		got, err := parseSubtechTextSections(text, "2011-09-27", 123)
		if err != nil {
			t.Fatalf("parseSubtechTextSections() error = %v", err)
		}
		if len(got) != 2 {
			t.Fatalf("len(got) = %d, want 2", len(got))
		}
		if got[0].Title != "シリアライザ" {
			t.Errorf("got[0].Title = %q, want %q", got[0].Title, "シリアライザ")
		}
		if !strings.Contains(got[0].Body, "** Storable") {
			t.Errorf("got[0].Body does not contain subsection heading: %q", got[0].Body)
		}
		if got[1].Title != "OSX のマウスの加速度がムカつく" {
			t.Errorf("got[1].Title = %q, want %q", got[1].Title, "OSX のマウスの加速度がムカつく")
		}
		if !strings.Contains(got[1].Body, ">|c|") {
			t.Errorf("got[1].Body does not contain codeblock marker: %q", got[1].Body)
		}
	})

	t.Run("blank title section", func(t *testing.T) {
		text := `*1254201203*gerry++

*1254158936*
最近やたら文字コードまわりをいじっていた`

		got, err := parseSubtechTextSections(text, "2009-09-29", 377)
		if err != nil {
			t.Fatalf("parseSubtechTextSections() error = %v", err)
		}
		if len(got) != 2 {
			t.Fatalf("len(got) = %d, want 2", len(got))
		}
		if got[0].Title != "gerry++" {
			t.Errorf("got[0].Title = %q, want %q", got[0].Title, "gerry++")
		}
		if got[1].Title != "" {
			t.Errorf("got[1].Title = %q, want empty title", got[1].Title)
		}
		if !strings.Contains(got[1].Body, "最近やたら文字コード") {
			t.Errorf("got[1].Body = %q, want content", got[1].Body)
		}
	})
}

func TestImportSubtech_ExistingSameDayEntriesAndStoredFields(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()

	config := app.LoadConfig()
	application := app.NewApp(config, dbs.MainDB, dbs.TFIDFDB, dbs.WorkerDB, dbs.ImagesDB, dbs.CacheDB, nil, nil, nil, nil)
	ctx := context.Background()

	existingAt := time.Date(2019, 7, 8, 10, 0, 0, 0, app.APP_TZ)
	_, err := dbs.MainDB.Exec(`
		INSERT INTO entries (id, title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, status)
		VALUES (1, 'existing', 'existing', '<p>existing</p>', '', '', '2019/07/08/10', 'Hatena', '2019-07-08', ?, ?, 'public')
	`, existingAt, existingAt)
	if err != nil {
		t.Fatalf("failed to insert existing entry: %v", err)
	}

	csvPath := filepath.Join(t.TempDir(), "subtech.csv")
	err = writeSubtechCSV(csvPath, [][]string{
		{"date", "title", "body", "comment", "text"},
		{
			"2019-07-08",
			"",
			"",
			"",
			"*1562562166*first\nhello world\n\n*1562562266*second\nline2",
		},
	})
	if err != nil {
		t.Fatal(err)
	}

	if err := ImportSubtech(ctx, application, []string{"-file", csvPath, "-wet-run"}); err != nil {
		t.Fatalf("ImportSubtech() error = %v", err)
	}

	first, err := application.MainDB().Q.GetEntryByPath(ctx, "2019/07/08/11")
	if err != nil {
		t.Fatalf("failed to get first imported entry: %v", err)
	}
	second, err := application.MainDB().Q.GetEntryByPath(ctx, "2019/07/08/12")
	if err != nil {
		t.Fatalf("failed to get second imported entry: %v", err)
	}

	if first.Title != "[subtech] first" {
		t.Errorf("first.Title = %q, want %q", first.Title, "[subtech] first")
	}
	if second.Title != "[subtech] second" {
		t.Errorf("second.Title = %q, want %q", second.Title, "[subtech] second")
	}

	wantFirstAt := time.Unix(1562562166, 0).In(app.APP_TZ)
	wantSecondAt := time.Unix(1562562266, 0).In(app.APP_TZ)
	if !first.CreatedAt.Equal(wantFirstAt) {
		t.Errorf("first.CreatedAt = %v, want %v", first.CreatedAt, wantFirstAt)
	}
	if !second.CreatedAt.Equal(wantSecondAt) {
		t.Errorf("second.CreatedAt = %v, want %v", second.CreatedAt, wantSecondAt)
	}
	if first.CreatedAt.Location().String() != "Asia/Tokyo" {
		t.Errorf("first.CreatedAt timezone = %s, want Asia/Tokyo", first.CreatedAt.Location())
	}
	if second.CreatedAt.Location().String() != "Asia/Tokyo" {
		t.Errorf("second.CreatedAt timezone = %s, want Asia/Tokyo", second.CreatedAt.Location())
	}

	if !strings.Contains(first.FormattedBody, "<p>hello world</p>") {
		t.Errorf("first.FormattedBody = %q, want contains <p>hello world</p>", first.FormattedBody)
	}
	if !strings.Contains(second.FormattedBody, "<p>line2</p>") {
		t.Errorf("second.FormattedBody = %q, want contains <p>line2</p>", second.FormattedBody)
	}
}

func TestImportSubtech_NoWetRunDoesNotWrite(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()

	config := app.LoadConfig()
	application := app.NewApp(config, dbs.MainDB, dbs.TFIDFDB, dbs.WorkerDB, dbs.ImagesDB, dbs.CacheDB, nil, nil, nil, nil)
	ctx := context.Background()

	csvPath := filepath.Join(t.TempDir(), "subtech.csv")
	err := writeSubtechCSV(csvPath, [][]string{
		{"date", "title", "body", "comment", "text"},
		{
			"2019-07-08",
			"",
			"",
			"",
			"*1562562166*first\nhello world",
		},
	})
	if err != nil {
		t.Fatal(err)
	}

	if err := ImportSubtech(ctx, application, []string{"-file", csvPath}); err != nil {
		t.Fatalf("ImportSubtech() error = %v", err)
	}

	count, err := application.MainDB().Q.CountAllEntries(ctx)
	if err != nil {
		t.Fatalf("CountAllEntries() error = %v", err)
	}
	if count != 0 {
		t.Errorf("entry count = %d, want 0", count)
	}
}

func TestDecorateSubtechTitle(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want string
	}{
		{name: "normal", in: "hello", want: "[subtech] hello"},
		{name: "empty", in: "", want: "[subtech]"},
		{name: "spaces only", in: "   ", want: "[subtech]"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := decorateSubtechTitle(tt.in)
			if got != tt.want {
				t.Errorf("decorateSubtechTitle(%q) = %q, want %q", tt.in, got, tt.want)
			}
		})
	}
}

func writeSubtechCSV(path string, rows [][]string) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()

	w := csv.NewWriter(f)
	for _, row := range rows {
		if err := w.Write(row); err != nil {
			return err
		}
	}
	w.Flush()
	return w.Error()
}
