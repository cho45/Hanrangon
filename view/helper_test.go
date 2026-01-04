package view

import (
	"testing"
)

func TestIsSameDay(t *testing.T) {
	tests := []struct {
		name string
		t1   string
		t2   string
		want bool
	}{
		{
			name: "Same day",
			t1:   "2025-12-30",
			t2:   "2025-12-30",
			want: true,
		},
		{
			name: "Different day",
			t1:   "2025-12-30",
			t2:   "2025-12-31",
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
