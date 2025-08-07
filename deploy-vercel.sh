#!/bin/bash

echo "🚀 DÉPLOIEMENT VERCEL - ORACLE PORTFOLIO V3.0 SECTEURS"
echo "======================================================"

# Variables
PROJECT_NAME="oracle-portfolio-v3-vercel"
BRANCH_NAME="main"

# 1. Vérifications préalables
echo "🔍 Vérifications préalables..."

# Vérifier Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ requis. Version actuelle: $(node --version)"
    exit 1
fi

# Vérifier que nous sommes dans un repo Git
if [ ! -d ".git" ]; then
    echo "❌ Pas dans un repository Git"
    exit 1
fi

# Vérifier la branche
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
    echo "⚠️  Branche actuelle: $CURRENT_BRANCH"
    echo "🔄 Changement vers $BRANCH_NAME..."
    git checkout $BRANCH_NAME
fi

# 2. Nettoyage complet
echo "🧹 Nettoyage des caches..."
rm -rf node_modules package-lock.json .vite dist .vercel

# 3. Installation avec legacy peer deps
echo "📦 Installation des dépendances..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Échec de l'installation des dépendances"
    exit 1
fi

# 4. Test de build local obligatoire
echo "🔨 Test de build local..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build local échoué ! Arrêt du déploiement."
    exit 1
fi

echo "✅ Build local réussi !"

# 5. Vérification des fichiers critiques
echo "🔍 Vérification des fichiers critiques..."

if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json manquant"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json manquant"
    exit 1
fi

# Vérifier date-fns version
DATE_FNS_VERSION=$(grep '"date-fns"' package.json | grep -o '"[^"]*"' | tail -1 | tr -d '"')
if [[ "$DATE_FNS_VERSION" == ^4.* ]]; then
    echo "❌ date-fns version 4.x détectée. Utiliser 3.6.0"
    exit 1
fi

echo "✅ Fichiers critiques validés"

# 6. Commit et push
echo "📤 Commit et push vers GitHub..."
git add .
git commit -m "deploy: Oracle Portfolio V3.0 Secteurs optimisé - $(date '+%Y-%m-%d %H:%M:%S')

✅ CORRECTIONS APPLIQUÉES
- date-fns 3.6.0 (compatible)
- vercel.json optimisé sans functions
- Installation --legacy-peer-deps
- Build local validé

✅ FONCTIONNALITÉS V3.0
- 11 secteurs d'activité
- Graphiques interactifs Recharts
- Interface moderne Tailwind CSS
- Responsive design complet

🎯 PRÊT POUR DÉPLOIEMENT VERCEL"

git push origin $BRANCH_NAME

if [ $? -ne 0 ]; then
    echo "❌ Échec du push GitHub"
    exit 1
fi

echo "✅ Push GitHub réussi"

# 7. Informations de déploiement
echo ""
echo "🎉 DÉPLOIEMENT DÉCLENCHÉ SUR VERCEL !"
echo "======================================"
echo "📋 Projet: $PROJECT_NAME"
echo "🌿 Branche: $BRANCH_NAME"
echo "🌐 URL attendue: https://$PROJECT_NAME.vercel.app"
echo ""
echo "⏳ Surveillez le déploiement sur: https://vercel.com/dashboard"
echo ""
echo "📊 FONCTIONNALITÉS DÉPLOYÉES:"
echo "   - 11 secteurs d'activité analysés"
echo "   - Graphique circulaire interactif"
echo "   - Table avec tri automatique"
echo "   - Interface responsive moderne"
echo "   - Classification A-F avec couleurs"
echo ""
echo "🚀 Oracle Portfolio V3.0 Secteurs déployé avec succès !"

