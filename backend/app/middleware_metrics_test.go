package app

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo-contrib/echoprometheus"
	"github.com/labstack/echo/v4"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/stretchr/testify/assert"
)

func TestMetrics(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	app := env.app.(*AppImpl)
	e := env.server

	// テストでは NewServer でミドルウェアがスキップされるため、ここで明示的に追加する
	e.Use(echoprometheus.NewMiddlewareWithConfig(echoprometheus.MiddlewareConfig{
		Registerer: app.prometheusRegistry,
		Namespace:  "hanrangon_test_metrics",
	}))

	// カスタムメトリクスの登録テスト
	customCounter := prometheus.NewCounter(prometheus.CounterOpts{
		Name: "custom_test_metric_total",
		Help: "Custom test metric for validation.",
	})
	// テスト環境でレジストリが共有されている可能性があるため、Register のエラーは無視するか
	// 既に登録されている場合はそれを使うようにする
	_ = app.PrometheusRegistry().Register(customCounter)
	customCounter.Inc()

	// 1. localhost からのアクセス (200 OK)
	t.Run("Access from localhost", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/metrics", nil)
		req.RemoteAddr = "127.0.0.1:12345"
		rec := httptest.NewRecorder()

		// MetricsHandler を直接呼び出す
		h := app.MetricsHandler()
		c := e.NewContext(req, rec)

		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Body.String(), "custom_test_metric_total 1")
	})

	// 2. 外部 IP からのアクセス (403 Forbidden)
	t.Run("Access from external IP", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/metrics", nil)
		req.RemoteAddr = "192.168.1.1:12345"
		rec := httptest.NewRecorder()

		h := app.MetricsHandler()
		c := e.NewContext(req, rec)

		err := h(c)
		// MetricsHandler は echo.HTTPError を返す
		if assert.Error(t, err) {
			he, ok := err.(*echo.HTTPError)
			assert.True(t, ok)
			assert.Equal(t, http.StatusForbidden, he.Code)
		}
	})

	// 3. メトリクスの計測 (http_requests_total の更新)
	t.Run("Metrics measurement", func(t *testing.T) {
		// / (HandleIndex) にアクセス。NewServer で既に MetricsMiddleware が適用されている
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)

		// /metrics を確認
		reqM := httptest.NewRequest(http.MethodGet, "/metrics", nil)
		reqM.RemoteAddr = "127.0.0.1:12345"
		recM := httptest.NewRecorder()

		// サーバー全体のハンドラーを通してアクセス
		e.ServeHTTP(recM, reqM)

		body := recM.Body.String()
		// echoprometheus のデフォルトメトリクス名を確認
		// path は echoprometheus のデフォルトでは url として記録される場合があるが、
		// ここでは少なくともリクエストがカウントされていることを確認する
		assert.Contains(t, body, `hanrangon_test_metrics_echo_requests_total`)
		assert.Contains(t, body, `code="200"`)
		assert.Contains(t, body, `method="GET"`)
		assert.Contains(t, body, `url="/"`)
	})
}

func TestMetricsMiddleware_Error(t *testing.T) {
	env := setupTest(t)
	defer env.close()
	app := env.app.(*AppImpl)
	e := env.server

	e.Use(echoprometheus.NewMiddlewareWithConfig(echoprometheus.MiddlewareConfig{
		Registerer: app.prometheusRegistry,
		Namespace:  "hanrangon_test_error",
	}))

	t.Run("Measure 404 error", func(t *testing.T) {
		// 存在しないパスへのアクセス
		req := httptest.NewRequest(http.MethodGet, "/not-found-metrics-test", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		// /metrics を確認
		reqM := httptest.NewRequest(http.MethodGet, "/metrics", nil)
		reqM.RemoteAddr = "127.0.0.1:12345"
		recM := httptest.NewRecorder()
		e.ServeHTTP(recM, reqM)

		body := recM.Body.String()
		// エラー時も計測されていること
		assert.Contains(t, body, `hanrangon_test_error_echo_requests_total`)
		assert.Contains(t, body, `code="404"`)
	})
}
