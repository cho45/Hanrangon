#!/bin/bash
set -e

# Change to the project root directory
cd "$(dirname "$0")/.."

echo "Compressing static assets..."
find static -type f \( -name "*.css" -o -name "*.js" \) | while read -r file; do
	# gzip: compress if .gz doesn't exist or is older than source
	if [[ ! -f "${file}.gz" ]] || [[ "$file" -nt "${file}.gz" ]]; then
		echo "gzip: $file"
		gzip -c -9 "$file" > "${file}.gz"
	fi

	# brotli: compress if .br doesn't exist or is older than source
	if command -v brotli >/dev/null 2>&1; then
		if [[ ! -f "${file}.br" ]] || [[ "$file" -nt "${file}.br" ]]; then
			echo "brotli: $file"
			brotli -w 18 -c -10 "$file" > "${file}.br"
		fi
	fi
done
