#!/bin/sh

# Stop on error
set -e

# Default Django settings module
: "${DJANGO_SETTINGS_MODULE:=config.settings}"
export DJANGO_SETTINGS_MODULE

# Gunicorn defaults - override with env vars if needed
: "${GUNICORN_BIND:=0.0.0.0:8000}"
: "${GUNICORN_WORKERS:=3}"
: "${GUNICORN_THREADS:=2}"
: "${GUNICORN_TIMEOUT:=120}"
: "${GUNICORN_ACCESS_LOGFILE:=-}"
: "${GUNICORN_ERROR_LOGFILE:=-}"
: "${GUNICORN_LOG_LEVEL:=info}"

echo "Waiting for postgres..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application \
  --bind "$GUNICORN_BIND" \
  --workers "$GUNICORN_WORKERS" \
  --threads "$GUNICORN_THREADS" \
  --timeout "$GUNICORN_TIMEOUT" \
  --access-logfile "$GUNICORN_ACCESS_LOGFILE" \
  --error-logfile "$GUNICORN_ERROR_LOGFILE" \
  --log-level "$GUNICORN_LOG_LEVEL"
