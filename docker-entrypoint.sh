#!/bin/sh
set -e

# Ensure persistent SQLite data directory exists and has correct ownership for node user
mkdir -p /app/data
chown -R node:node /app/data 2>/dev/null || true
chmod -R 775 /app/data 2>/dev/null || true

# If container started as root, drop privileges and execute as unprivileged 'node' user
if [ "$(id -u)" = '0' ]; then
    exec su-exec node "$@"
fi

exec "$@"
