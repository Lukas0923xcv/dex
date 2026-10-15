#!/bin/sh
set -e

# Ensure persistent SQLite data directory exists with secure permissions (node:node)
mkdir -p /app/data
chmod 750 /app/data 2>/dev/null || true
chown -R node:node /app/data 2>/dev/null || true

# If container started as root, drop privileges and execute as unprivileged 'node' user
if [ "$(id -u)" = '0' ] && command -v su-exec >/dev/null 2>&1; then
    exec su-exec node "$@"
fi

exec "$@"
