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
# Utilisation de --legacy-peer-deps pour éviter les conflits connus
npm install --legacy-peer-deps
npm run build -- --base-href /
cd ..

# Vérification du build
if [ ! -d "frontend/dist/frontend/browser" ]; then
    echo "❌ Erreur: Le dossier de build est introuvable."
    exit 1
fi

# 3. Préparation du dossier de release
echo "📂 Création du dossier de release : $RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

# 4. Compression (on compresse le contenu de dist/frontend/browser)
echo "🗜️ Création de l'archive .tar.gz..."
tar -czf "$RELEASE_DIR/$ARCHIVE_NAME" -C frontend/dist/frontend/browser .

# 5. Calcul de l'empreinte SHA-256
echo "🔐 Calcul du Hash SHA-256..."
# Sur Linux: sha256sum, sur Mac: shasum -a 256
if command -v sha256sum >/dev/null 2>&1; then
    HASH=$(sha256sum "$RELEASE_DIR/$ARCHIVE_NAME" | awk '{ print $1 }')
else
    HASH=$(shasum -a 256 "$RELEASE_DIR/$ARCHIVE_NAME" | awk '{ print $1 }')
fi

# 6. Génération des métadonnées JSON
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
