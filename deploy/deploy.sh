#!/bin/bash
set -e

# Change to the project root directory
cd "$(dirname "$0")/.."

make

./deploy/compress-static.sh

echo "Restarting hanrangon.service..."
sudo systemctl restart hanrangon.service

echo "Warming up cache..."
curl -s --head -H 'Cache-Control: no-cache' https://lowreal.net > /srv/www/lowreal.net.link.txt

echo "Deployment finished."
