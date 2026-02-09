#!/bin/sh

# Stop on error
set -e

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
# Assume 'config' is the project name based on file structure
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000
