#!/bin/bash
# scripts/setup.sh - Installation complète Oracle Portfolio v4.1

set -e

echo "🚀 Oracle Portfolio v4.1 - Installation"
echo "====================================="

# Vérification des prérequis
check_requirements() {
    echo "📋 Vérification des prérequis..."
    
    # Node.js 20+
    if ! command -v node &> /dev/null || [ $(node -v | cut -d. -f1 | cut -dv -f2) -lt 20 ]; then
        echo "❌ Node.js 20+ requis"
        echo "Installation: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
        exit 1
    fi
    
    # PostgreSQL 15+
    if ! command -v psql &> /dev/null; then
        echo "❌ PostgreSQL 15+ requis"
        echo "Installation: sudo apt install postgresql-15 postgresql-contrib"
        exit 1
    fi
    
    # PM2
    if ! command -v pm2 &> /dev/null; then
        echo "📦 Installation de PM2..."
        npm install -g pm2
    fi
    
    echo "✅ Prérequis OK"
}

# Configuration initiale
setup_environment() {
    echo "🔧 Configuration de l'environnement..."
    
    # Copier le template .env
    if [ ! -f .env ]; then
        cp env.example .env
        echo "⚠️  Fichier .env créé - À configurer!"
    fi
    
    # Générer les clés secrètes
    echo "Génération des clés secrètes..."
    JWT_SECRET=$(openssl rand -base64 32)
    SESSION_SECRET=$(openssl rand -base64 32)
    
    # Mettre à jour .env
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env
    
    echo "✅ Configuration OK"
}

# Installation des dépendances
install_dependencies() {
    echo "📦 Installation des dépendances..."
    
    # Root dependencies
    npm install
    
    # Frontend dependencies
    cd packages/frontend && npm install && cd ../..
    
    # Backend dependencies  
    cd packages/backend && npm install && cd ../..
    
    echo "✅ Dépendances installées"
}

# Configuration de la base de données
setup_database() {
    echo "🗄️ Configuration de la base de données..."
    
    # Créer la base de données
    sudo -u postgres psql <<EOF
CREATE DATABASE oracle_portfolio;
CREATE USER oracle_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE oracle_portfolio TO oracle_user;
EOF
    
    # Exécuter les migrations
    cd packages/backend
    npx prisma migrate deploy
    npx prisma db seed
    cd ../..
    
    echo "✅ Base de données configurée"
}

# Configuration Nginx
setup_nginx() {
    echo "🌐 Configuration Nginx..."
    
    # Copier la configuration
    sudo cp scripts/nginx/oracle-portfolio.conf /etc/nginx/sites-available/
    sudo ln -s /etc/nginx/sites-available/oracle-portfolio.conf /etc/nginx/sites-enabled/
    
    # SSL avec Let's Encrypt
    if [ "$1" == "production" ]; then
        echo "🔒 Configuration SSL..."
        sudo certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos -m $ADMIN_EMAIL
    fi
    
    # Recharger Nginx
    sudo nginx -t && sudo systemctl reload nginx
    
    echo "✅ Nginx configuré"
}

# Configuration PM2
setup_pm2() {
    echo "⚙️ Configuration PM2..."
    
    # Créer l'écosystème PM2
    cat > ecosystem.config.js << 'EOF'
module.exports = {
 apps: [
   {
     name: 'oracle-backend',
     script: './packages/backend/dist/index.js',
     instances: 2,
     exec_mode: 'cluster',
     env: {
       NODE_ENV: 'production',
       PORT: 3001
     },
     error_file: './logs/backend-error.log',
     out_file: './logs/backend-out.log',
     log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
   },
   {
     name: 'oracle-frontend',
     script: 'npm',
     args: 'start',
     cwd: './packages/frontend',
     env: {
       NODE_ENV: 'production',
       PORT: 3000
     },
     error_file: './logs/frontend-error.log',
     out_file: './logs/frontend-out.log'
   }
 ]
};
EOF
    
    # Démarrer les applications
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    echo "✅ PM2 configuré"
}

# Build de production
build_production() {
    echo "🏗️ Build de production..."
    
    # Build shared
    cd packages/shared && npm run build && cd ../..
    
    # Build backend
    cd packages/backend && npm run build && cd ../..
    
    # Build frontend
    cd packages/frontend && npm run build && cd ../..
    
    echo "✅ Build terminé"
}

# Configuration des backups
setup_backups() {
    echo "💾 Configuration des backups..."
    
    # Créer le répertoire de backup
    mkdir -p /opt/oracle-portfolio/backups
    
    # Ajouter le cron job
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/oracle-portfolio/scripts/backup.sh") | crontab -
    
    echo "✅ Backups configurés"
}

# Configuration du monitoring
setup_monitoring() {
    echo "📊 Configuration du monitoring..."
    
    # Installer Prometheus node exporter
    wget https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz
    tar xvf node_exporter-1.7.0.linux-amd64.tar.gz
    sudo cp node_exporter-1.7.0.linux-amd64/node_exporter /usr/local/bin/
    
    # Service systemd pour node_exporter
    sudo cat > /etc/systemd/system/node_exporter.service << 'EOF'
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable node_exporter
    sudo systemctl start node_exporter
    
    echo "✅ Monitoring configuré"
}

# Menu principal
main() {
    echo ""
    echo "Sélectionnez le type d'installation:"
    echo "1) Développement local"
    echo "2) Production"
    echo "3) Mise à jour"
    
    read -p "Votre choix [1-3]: " choice
    
    case $choice in
        1)
            echo "🔧 Installation en mode développement..."
            check_requirements
            setup_environment
            install_dependencies
            setup_database
            echo ""
            echo "✅ Installation terminée!"
            echo "Démarrer avec: npm run dev"
            ;;
        2)
            echo "🚀 Installation en mode production..."
            check_requirements
            setup_environment
            install_dependencies
            setup_database
            build_production
            setup_nginx production
            setup_pm2
            setup_backups
            setup_monitoring
            echo ""
            echo "✅ Installation terminée!"
            echo "Application disponible sur https://$DOMAIN_NAME"
            ;;
        3)
            echo "🔄 Mise à jour..."
            git pull origin main
            install_dependencies
            build_production
            pm2 reload all
            echo "✅ Mise à jour terminée!"
            ;;
        *)
            echo "❌ Choix invalide"
            exit 1
            ;;
    esac
}

# Exécution
main 