#!/bin/sh
set -e
cd /app
if [ ! -d node_modules/@nestjs/common ]; then
  npm ci
fi
exec npm run "$@"
