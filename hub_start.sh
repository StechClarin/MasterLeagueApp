#!/bin/bash
# Startup script for School Manager (Ethernanos Hub)

# 1. Parse Arguments from Hub
while [[ $# -gt 0 ]]; do
  case $1 in
    --db-host) export DB_HOST="$2"; shift 2 ;;
    --db-port) export DB_PORT="$2"; shift 2 ;;
    --db-name) export DB_NAME="$2"; shift 2 ;;
    --db-user) export DB_USER="$2"; shift 2 ;;
    --db-pass) export DB_PASS="$2"; shift 2 ;;
    --tenant-id) export TENANT_ID="$2"; shift 2 ;;
    --app-port) export APP_PORT="$2"; shift 2 ;;
    --admin-pass) export ADMIN_DEFAULT_PASSWORD="$2"; shift 2 ;;
    *) shift ;;
  esac
done

# 2. Build DATABASE_URL for django-environ
export DATABASE_URL="postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
export DEBUG=False
export APP_PORT=${APP_PORT:-8000}

# 3. Virtual Environment (Optional but recommended)
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# 4. Prepare Database & Seed
echo "🚀 Initializing School Manager database..."
# On passe le mot de passe explicitement pour éviter les problèmes d'env
python3 manage.py ether_setup --admin-pass "${ADMIN_DEFAULT_PASSWORD:-admin1234}"

# 5. Start Server
echo "🎯 Launching School Manager on port ${APP_PORT}..."
# Using runserver for now as it's a local desktop app context
exec python3 manage.py runserver 0.0.0.0:${APP_PORT}
