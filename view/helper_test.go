package view

import (
	"testing"
	"time"
)

func TestIsSameDay(t *testing.T) {
	tests := []struct {
		name string
		t1   time.Time
		t2   time.Time
		want bool
	}{
		{
			name: "Same day",
			t1:   time.Date(2025, 12, 30, 10, 0, 0, 0, time.UTC),
			t2:   time.Date(2025, 12, 30, 23, 59, 59, 0, time.UTC),
			want: true,
		},
		{
			name: "Different day",
			t1:   time.Date(2025, 12, 30, 23, 59, 59, 0, time.UTC),
			t2:   time.Date(2025, 12, 31, 0, 0, 0, 0, time.UTC),
			want: false,
		},
		{
			name: "Different month",
			t1:   time.Date(2025, 12, 30, 0, 0, 0, 0, time.UTC),
			t2:   time.Date(2025, 11, 30, 0, 0, 0, 0, time.UTC),
			want: false,
		},
		{
			name: "Different year",
			t1:   time.Date(2025, 12, 30, 0, 0, 0, 0, time.UTC),
			t2:   time.Date(2024, 12, 30, 0, 0, 0, 0, time.UTC),
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := IsSameDay(tt.t1, tt.t2); got != tt.want {
				t.Errorf("IsSameDay() = %v, want %v", got, tt.want)
			}
		})
	}
}
