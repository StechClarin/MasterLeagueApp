#!/bin/bash

# Script de Packaging pour EtherNanos Hub
# Usage: ./scripts/package.sh <version>
# Exemple: ./scripts/package.sh 1.0.0

VERSION=$1
if [ -z "$VERSION" ]; then
    echo "❌ Erreur: Vous devez spécifier une version (ex: 1.0.0)"
    echo "Usage: ./scripts/package.sh <version>"
    exit 1
fi

# Arrêter le script en cas d'erreur
set -e

# S'assurer qu'on est à la racine du projet
if [ ! -f "ethernanos.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet (contenant ethernanos.json)"
    exit 1
fi

APP_NAME="schoolmanage"
RELEASE_DIR="./releases/$VERSION"
ARCHIVE_NAME="$APP_NAME-v$VERSION.tar.gz"

echo "🚀 Démarrage du packaging : $APP_NAME v$VERSION"

# 1. Nettoyage
echo "🧹 Nettoyage des builds précédents..."
rm -rf frontend/dist

# 2. Build Frontend
echo "🏗️ Build du Frontend Angular..."
cd frontend
npm install --legacy-peer-deps
npm run build -- --base-href /
cd ..

# Vérification du build frontend
if [ ! -d "frontend/dist/frontend/browser" ]; then
    echo "❌ Erreur: Le dossier de build frontend est introuvable."
    exit 1
fi

# 3. Préparation de la Zone de Staging
echo "📂 Préparation des fichiers (Staging)..."
mkdir -p "$RELEASE_DIR"

STAGING="staging_tmp"
rm -rf "$STAGING"
mkdir -p "$STAGING"


# Copie des fichiers Manifest Hub (CRITIQUE)
echo "📋 Copie des manifests Hub (ethernanos.json, hub_start.sh)..."
cp ethernanos.json "$STAGING/"
cp hub_start.sh "$STAGING/"

# Copie du Frontend Build
echo "📋 Copie du build frontend..."
mkdir -p "$STAGING/frontend_build"
cp -r frontend/dist/frontend/browser/* "$STAGING/frontend_build/"

# 4. Compression (on compresse le CONTENU du staging)
echo "🗜️ Création de l'archive .tar.gz (Production)..."
cd "$STAGING"
# Utilisation de . pour que les fichiers soient à la racine de l'archive
tar -czf "../$RELEASE_DIR/$ARCHIVE_NAME" .
cd ..

# Nettoyage
rm -rf "$STAGING"

# 5. Calcul de l'empreinte SHA-256
echo "🔐 Calcul du Hash SHA-256..."
if command -v sha256sum >/dev/null 2>&1; then
    HASH=$(sha256sum "$RELEASE_DIR/$ARCHIVE_NAME" | awk '{ print $1 }')
else
    HASH=$(shasum -a 256 "$RELEASE_DIR/$ARCHIVE_NAME" | awk '{ print $1 }')
fi

# 6. Génération des métadonnées JSON pour le Hub
echo "📝 Génération de metadata.json..."
cat <<EOF > "$RELEASE_DIR/metadata.json"
{
  "app": "$APP_NAME",
  "version": "$VERSION",
  "hash": "$HASH",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "archive": "$ARCHIVE_NAME"
}
EOF

echo "--------------------------------------------------"
echo "✅ PACKAGING TERMINÉ AVEC SUCCÈS !"
echo "📦 Archive : $RELEASE_DIR/$ARCHIVE_NAME"
echo "🔑 Hash    : $HASH"
echo "--------------------------------------------------"
echo "CONSEIL : Téléchargez l'archive et utilisez ce Hash dans la release Hub."
