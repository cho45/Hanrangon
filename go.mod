module github.com/cho45/hanrangon

go 1.24.3

require (
	github.com/BurntSushi/toml v1.6.0
	github.com/Masterminds/sprig/v3 v3.3.0
	github.com/aws/aws-sdk-go-v2 v1.41.0
	github.com/aws/aws-sdk-go-v2/credentials v1.19.6
	github.com/aws/aws-sdk-go-v2/service/s3 v1.95.0
	github.com/cho45/xatena-go v0.0.0-20250711122401-413f434d6e12
	github.com/google/uuid v1.6.0
	github.com/gorilla/sessions v1.4.0
	github.com/labstack/echo-contrib v0.17.4
	github.com/labstack/echo/v4 v4.14.0
	github.com/mattn/go-sqlite3 v1.14.32
	github.com/nfnt/resize v0.0.0-20180221191011-83c6a9932646
	github.com/sergi/go-diff v1.4.0
	github.com/stretchr/testify v1.11.1
	github.com/vegidio/avif-go v0.0.0-20260104153230-9241dada5213
	github.com/yuin/goldmark v1.7.13
	golang.org/x/crypto v0.46.0
	golang.org/x/image v0.34.0
	golang.org/x/net v0.48.0
	golang.org/x/sync v0.19.0
	golang.org/x/term v0.38.0
	golang.org/x/text v0.32.0
)

require (
	dario.cat/mergo v1.0.1 // indirect
	github.com/Masterminds/goutils v1.1.1 // indirect
	github.com/Masterminds/semver/v3 v3.3.0 // indirect
	github.com/aws/aws-sdk-go-v2/aws/protocol/eventstream v1.7.4 // indirect
	github.com/aws/aws-sdk-go-v2/internal/configsources v1.4.16 // indirect
	github.com/aws/aws-sdk-go-v2/internal/endpoints/v2 v2.7.16 // indirect
	github.com/aws/aws-sdk-go-v2/internal/v4a v1.4.16 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/accept-encoding v1.13.4 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/checksum v1.9.7 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/presigned-url v1.13.16 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/s3shared v1.19.16 // indirect
	github.com/aws/smithy-go v1.24.0 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/gorilla/context v1.1.2 // indirect
	github.com/gorilla/securecookie v1.1.2 // indirect
	github.com/huandu/xstrings v1.5.0 // indirect
	github.com/labstack/gommon v0.4.2 // indirect
	github.com/mattn/go-colorable v0.1.14 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mitchellh/copystructure v1.2.0 // indirect
	github.com/mitchellh/reflectwalk v1.0.2 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/shopspring/decimal v1.4.0 // indirect
	github.com/spf13/cast v1.7.0 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasttemplate v1.2.2 // indirect
	golang.org/x/sys v0.39.0 // indirect
	golang.org/x/time v0.14.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)

replace github.com/cho45/xatena-go => ./backend/xatena-go
