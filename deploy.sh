#!/usr/bin/env bash
# Deploy SpecSeed.io: static build + nginx reload.
set -euo pipefail

cd "$(dirname "$0")"

echo "=== npm run build ==="
npm run build

echo "=== reload nginx ==="
sudo systemctl reload nginx

echo "=== deploy complete ==="
echo "Serving from: /var/www/specseed-io/out"
