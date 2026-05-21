#!/bin/sh

# Stop on error
set -e

# Force UTF-8 encoding for Python to avoid migration decoding errors
export PYTHONIOENCODING=utf-8
export PYTHONDEFAULTENCODING=utf-8

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

# Extraire dynamiquement l'hôte et le port de DATABASE_URL si configuré
DB_HOST="db"
DB_PORT="5432"

if [ -n "$DATABASE_URL" ]; then
  # Extraire la partie après '@' et avant '/'
  TEMP_HOST_PORT=$(echo "$DATABASE_URL" | sed -e 's|^.*@||' -e 's|/.*$||')
  # Si un port est spécifié avec ':'
  if echo "$TEMP_HOST_PORT" | grep -q ":"; then
    DB_HOST=$(echo "$TEMP_HOST_PORT" | cut -d':' -f1)
    DB_PORT=$(echo "$TEMP_HOST_PORT" | cut -d':' -f2)
  else
    DB_HOST="$TEMP_HOST_PORT"
  fi
fi

echo "Waiting for postgres on $DB_HOST:$DB_PORT..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
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
