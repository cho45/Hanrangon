package app

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"

	"github.com/labstack/echo/v4"
)

const (
	SessionKeyName  = "sk"
	CSRFHeaderName  = "X-Requested-With"
	CSRFHeaderValue = "fetch"
	CSRFCookieName  = "sk"
)

func GenerateRandomString(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func (app *AppImpl) CSRF(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// 公開されている GET/HEAD/OPTIONS ルートをホワイトリスト化し、不要な CSRF Cookie の生成を避ける。
		// フォームを表示するパス（/login など）や管理アクションのみが CSRF トークンを必要とする。
		if method := c.Request().Method; method == http.MethodGet || method == http.MethodHead || method == http.MethodOptions {
			switch c.Path() {
			case "/", "/archive", "/feed", "/sitemap.xml", "/robots.txt", "/api/similar",
				"/.page/:date/:limit", "/:param/", "/:yyyy/:mm/", "/:yyyy/:mm/:dd/",
				"/:category/.page/:date/:limit", "/*",
				"/css*", "/js*", "/images*", "/images/entry*", "/static/admin*":
				return next(c)
			}
		}

		// 状態を変更するリクエスト、またはログイン/管理ページのために CSRF Cookie が存在することを確認する
		cookie, err := c.Cookie(CSRFCookieName)
		var sk string
		if err != nil {
			sk, _ = GenerateRandomString(16)
			newCookie := &http.Cookie{
				Name:     CSRFCookieName,
				Value:    sk,
				Path:     "/",
				HttpOnly: true,
				Secure:   c.IsTLS(),
				SameSite: http.SameSiteLaxMode,
			}
			c.SetCookie(newCookie)
		} else {
			sk = cookie.Value
		}

		// 安全なメソッド（参照系）は許可
		switch c.Request().Method {
		case http.MethodGet, http.MethodHead, http.MethodOptions:
			return next(c)
		}

		// CSRF 対策: 以下の 2 段階のチェックを行う

		// 1. AJAX/fetch リクエストに対するカスタムヘッダーの確認
		// ブラウザの同一生成元ポリシー (SOP) により、クロスドメインのリクエストでは
		// 事前の CORS 許可なしにカスタムヘッダーを付与することはできない。
		if c.Request().Header.Get(CSRFHeaderName) == CSRFHeaderValue {
			return next(c)
		}

		// 2. Double Submit Cookie チェック
		// Cookie に保存された値と、リクエストパラメータ（フォームまたはクエリ）に含まれる値が
		// 一致することを確認する。攻撃者はユーザーの Cookie を読み取ることができないため、
		// 正しいトークンをリクエストに含めることができない。
		reqSK := c.FormValue(SessionKeyName)
		if reqSK == "" {
			reqSK = c.QueryParam(SessionKeyName)
		}

		if reqSK == "" || reqSK != sk {
			return echo.NewHTTPError(http.StatusForbidden, "CSRF token mismatch")
		}

		return next(c)
	}
}
