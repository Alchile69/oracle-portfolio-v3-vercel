#!/bin/sh
set -e

# Fonction pour démarrer le backend
start_backend() {
    echo "🚀 Démarrage du backend..."
    cd packages/backend
    exec node dist/index.js
}

# Fonction pour démarrer le frontend
start_frontend() {
    echo "🚀 Démarrage du frontend..."
    cd packages/frontend
    exec npm start
}

# Fonction pour démarrer les deux services
start_all() {
    echo "🚀 Démarrage d'Oracle Portfolio..."
    
    # Démarrer le backend en arrière-plan
    cd packages/backend
    node dist/index.js &
    BACKEND_PID=$!
    
    # Attendre que le backend soit prêt
    echo "⏳ Attente du backend..."
    until curl -f http://localhost:3001/health > /dev/null 2>&1; do
        sleep 1
    done
    echo "✅ Backend prêt"
    
    # Démarrer le frontend
    cd ../frontend
    exec npm start
}

# Fonction pour les migrations
run_migrations() {
    echo "🗄️ Exécution des migrations..."
    cd packages/backend
    npx prisma migrate deploy
    echo "✅ Migrations terminées"
}

# Fonction pour le seeding
run_seed() {
    echo "🌱 Exécution du seeding..."
    cd packages/backend
    npx prisma db seed
    echo "✅ Seeding terminé"
}

# Fonction pour les tests
run_tests() {
    echo "🧪 Exécution des tests..."
    npm test
    echo "✅ Tests terminés"
}

# Gestion des arguments
case "$1" in
    "backend")
        start_backend
        ;;
    "frontend")
        start_frontend
        ;;
    "start")
        start_all
        ;;
    "migrate")
        run_migrations
        ;;
    "seed")
        run_seed
        ;;
    "test")
        run_tests
        ;;
    "health")
        # Health check pour Docker
        curl -f http://localhost:3001/health || exit 1
        ;;
    *)
        echo "Usage: $0 {start|backend|frontend|migrate|seed|test|health}"
        echo ""
        echo "Commands:"
        echo "  start     - Démarrer l'application complète"
        echo "  backend   - Démarrer uniquement le backend"
        echo "  frontend  - Démarrer uniquement le frontend"
        echo "  migrate   - Exécuter les migrations de base de données"
        echo "  seed      - Exécuter le seeding de la base de données"
        echo "  test      - Exécuter les tests"
        echo "  health    - Vérifier la santé de l'application"
        exit 1
        ;;
esac 