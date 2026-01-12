package jobs

import (
	"os"
	"testing"

	"github.com/cho45/hanrangon/internal/testutil"
)

func TestMain(m *testing.M) {
	testutil.SetupEnvironment()
	os.Exit(m.Run())
}
