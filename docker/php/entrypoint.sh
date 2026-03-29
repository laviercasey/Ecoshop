#!/bin/sh
set -e

MAX_RETRIES=30
RETRY=0

echo "Waiting for PostgreSQL..."
until php -r "new PDO('pgsql:host=${DB_HOST:-postgres};port=${DB_PORT:-5432};dbname=${DB_DATABASE:-ecoshop}', '${DB_USERNAME:-ecoshop}', '${DB_PASSWORD:-secret}');" 2>/dev/null; do
    RETRY=$((RETRY + 1))
    if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
        echo "PostgreSQL is not available after ${MAX_RETRIES} attempts. Exiting."
        exit 1
    fi
    sleep 1
done
echo "PostgreSQL is up."

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force --isolated
php artisan app:create-admin
php artisan storage:link --force 2>/dev/null || true

exec "$@"
