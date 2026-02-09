#!/bin/bash

echo "🚀 Starting Deployment..."

# 1. Pull latest code
echo "📦 Pulling latest code..."
git pull

# 2. Build and Deploy
echo "🐳 Building and Starting Containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "✅ Deployment Complete!"
docker compose -f docker-compose.prod.yml ps
