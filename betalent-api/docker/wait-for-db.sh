#!/usr/bin/env sh
set -e

HOST="${DB_HOST:-mysql}"
PORT="${DB_PORT:-3306}"

echo "Waiting for MySQL at ${HOST}:${PORT}..."

while ! nc -z "${HOST}" "${PORT}"; do
  sleep 2
done

echo "MySQL is up"
