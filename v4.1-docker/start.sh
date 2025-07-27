#!/bin/bash

echo "🚀 Démarrage d'Oracle Portfolio v4.1"
echo "=================================="

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

# Vérifier la version de Node.js
NODE_VERSION=$(node -v | cut -d. -f1 | cut -dv -f2)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20+ est requis. Version actuelle: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) détecté"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Installer les dépendances des packages
echo "📦 Installation des dépendances des packages..."
cd packages/shared && npm install && cd ../..
cd packages/backend && npm install && cd ../..
cd packages/frontend && npm install && cd ../..

# Configurer l'environnement
if [ ! -f ".env" ]; then
    echo "🔧 Configuration de l'environnement..."
    cp env.example .env
    echo "⚠️  Fichier .env créé - Veuillez le configurer avec vos paramètres"
fi

# Générer le client Prisma
echo "🗄️ Génération du client Prisma..."
cd packages/backend
npx prisma generate
cd ../..

# Build des packages
echo "🔨 Build des packages..."
npm run build:shared
npm run build:backend

echo ""
echo "✅ Installation terminée !"
echo ""
echo "Pour démarrer l'application :"
echo "  npm run dev"
echo ""
echo "Ou démarrer séparément :"
echo "  Backend:   npm run dev:backend"
echo "  Frontend:  npm run dev:frontend"
echo ""
echo "📊 Dashboard: http://localhost:3000"
echo "🔌 API:       http://localhost:3001"
echo "🔍 Health:    http://localhost:3001/health" 