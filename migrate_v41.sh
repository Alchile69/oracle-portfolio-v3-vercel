#!/bin/bash

# Oracle Portfolio v4.1 Migration Script
# Stratégie de branches parallèles sécurisée
# Auteur: Manus AI
# Date: 27 janvier 2025

set -e  # Arrêt en cas d'erreur

# Configuration
REPO_URL="https://github.com/votre-username/oracle-portfolio.git"  # À modifier
BACKUP_SOURCE="/Users/alainponcelas/Desktop/Oracle_Portfolio_v4.1_Complete_Backup/oracle-portfolio-v4.1"
TEMP_DIR="./oracle-portfolio-temp"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        log_error "Git n'est pas installé"
        exit 1
    fi
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier que la source existe
    if [ ! -d "$BACKUP_SOURCE" ]; then
        log_error "Le dossier source $BACKUP_SOURCE n'existe pas"
        exit 1
    fi
    
    log_success "Tous les prérequis sont satisfaits"
}

# Nettoyage des fichiers temporaires
cleanup() {
    log_info "Nettoyage des fichiers temporaires..."
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}

# Gestion des erreurs
trap cleanup EXIT

# Cloner le repository existant
clone_repository() {
    log_info "Clonage du repository existant..."
    
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
    
    git clone "$REPO_URL" "$TEMP_DIR"
    cd "$TEMP_DIR"
    
    log_success "Repository cloné avec succès"
}

# Créer la structure de branches sécurisée
create_branch_structure() {
    log_info "Création de la structure de branches..."
    
    # Vérifier si on est sur main
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        git checkout main
    fi
    
    # Créer la branche de sauvegarde
    if ! git show-ref --verify --quiet refs/heads/backup-production-state; then
        git checkout -b backup-production-state
        git push origin backup-production-state
        log_success "Branche backup-production-state créée"
    else
        log_warning "Branche backup-production-state existe déjà"
    fi
    
    # Retourner sur main
    git checkout main
    
    # Créer la branche v4.1-integration
    if ! git show-ref --verify --quiet refs/heads/v4.1-integration; then
        git checkout -b v4.1-integration
        log_success "Branche v4.1-integration créée"
    else
        log_warning "Branche v4.1-integration existe déjà"
        git checkout v4.1-integration
    fi
}

# Copier et organiser les fichiers v4.1
copy_v41_files() {
    log_info "Copie des fichiers Oracle Portfolio v4.1..."
    
    # Nettoyer le répertoire (sauf .git)
    find . -mindepth 1 -not -path "./.git*" -delete
    
    # Copier tous les fichiers de la v4.1
    cp -r "$BACKUP_SOURCE"/* .
    cp -r "$BACKUP_SOURCE"/.* . 2>/dev/null || true
    
    # Supprimer les fichiers .DS_Store
    find . -name ".DS_Store" -delete
    
    log_success "Fichiers v4.1 copiés avec succès"
}

# Installer les dépendances et tester
test_installation() {
    log_info "Installation des dépendances et tests..."
    
    # Installer les dépendances
    npm install
    
    # Build des packages
    npm run build
    
    # Tests
    npm test
    
    log_success "Installation et tests réussis"
}

# Créer le commit initial
create_initial_commit() {
    log_info "Création du commit initial..."
    
    # Ajouter tous les fichiers
    git add .
    
    # Créer le commit
    git commit -m "feat: Add Oracle Portfolio v4.1 complete codebase

- Complete rewrite with modern architecture
- Modular structure with packages (shared, backend, frontend)
- Docker containerization with multi-stage build
- PostgreSQL database with Prisma ORM
- Next.js 14 frontend with TypeScript
- Node.js 20 backend with Express
- Comprehensive monitoring with Prometheus/Grafana
- Complete test suite with integration tests
- Security features and audit trail
- Documentation and deployment scripts

Version: 4.1.0
Migration: $TIMESTAMP"
    
    log_success "Commit initial créé"
}

# Créer les tags de version
create_version_tags() {
    log_info "Création des tags de version..."
    
    # Tag v4.1.0
    git tag -a v4.1.0 -m "Oracle Portfolio v4.1.0 - Version complète"
    
    # Tag de migration
    git tag -a "migration-$TIMESTAMP" -m "Migration v4.1 - $TIMESTAMP"
    
    log_success "Tags de version créés"
}

# Pousser vers GitHub
push_to_github() {
    log_info "Publication vers GitHub..."
    
    # Pousser la branche
    git push origin v4.1-integration
    
    # Pousser les tags
    git push origin --tags
    
    log_success "Code publié vers GitHub avec succès"
}

# Créer la branche staging
create_staging_branch() {
    log_info "Création de la branche staging..."
    
    git checkout -b v4.1-staging
    git push origin v4.1-staging
    
    log_success "Branche v4.1-staging créée"
}

# Afficher les instructions finales
show_final_instructions() {
    echo ""
    echo "🎉 MIGRATION ORACLE PORTFOLIO v4.1 TERMINÉE AVEC SUCCÈS !"
    echo ""
    echo "📋 Structure de branches créée :"
    echo "   • main (production actuelle - intacte)"
    echo "   • backup-production-state (sauvegarde)"
    echo "   • v4.1-integration (nouvelle version complète)"
    echo "   • v4.1-staging (pour tests)"
    echo ""
    echo "🚀 Prochaines étapes :"
    echo "   1. Tester la v4.1 sur staging :"
    echo "      git checkout v4.1-staging"
    echo "      npm run dev"
    echo ""
    echo "   2. Déployer sur environnement de staging :"
    echo "      oracle-portfolio-v41-staging.web.app"
    echo ""
    echo "   3. Quand prêt, migrer vers production :"
    echo "      git checkout main"
    echo "      git merge v4.1-integration"
    echo "      git push origin main"
    echo ""
    echo "📁 Fichiers temporaires nettoyés"
    echo "✅ Migration sécurisée terminée"
    echo ""
}

# Fonction principale
main() {
    echo "🚀 Oracle Portfolio v4.1 Migration Script"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    clone_repository
    create_branch_structure
    copy_v41_files
    test_installation
    create_initial_commit
    create_version_tags
    push_to_github
    create_staging_branch
    show_final_instructions
}

# Exécution du script
main "$@" 