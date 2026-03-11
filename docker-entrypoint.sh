#!/bin/sh
set -e

DB_FILE="${DATABASE_FILE:-/app/data/db.sqlite}"
DB_DIR="$(dirname "$DB_FILE")"

mkdir -p "$DB_DIR"

if [ ! -s "$DB_FILE" ]; then
  echo "[entrypoint] database file missing or empty, running init-db.mjs"
  node init-db.mjs
else
  echo "[entrypoint] database file exists, skip init-db.mjs"
fi

echo "[entrypoint] running migrations"
npx drizzle-kit migrate

echo "[entrypoint] starting server"
exec node server.js
