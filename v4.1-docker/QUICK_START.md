# Guide de Démarrage Rapide - Oracle Portfolio v4.1

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 20+ 
- npm 10+
- PostgreSQL 15+ (optionnel pour le développement)

### Installation Rapide

1. **Cloner le projet**
```bash
git clone <repository-url>
cd oracle-portfolio-v4.1
```

2. **Installation automatique**
```bash
chmod +x start.sh
./start.sh
```

3. **Démarrer l'application**
```bash
npm run dev
```

### Installation Manuelle

1. **Installer les dépendances**
```bash
npm install
cd packages/shared && npm install && cd ../..
cd packages/backend && npm install && cd ../..
cd packages/frontend && npm install && cd ../..
```

2. **Configurer l'environnement**
```bash
cp env.example .env
# Éditer .env avec vos paramètres
```

3. **Générer le client Prisma**
```bash
cd packages/backend
npx prisma generate
cd ../..
```

4. **Build des packages**
```bash
npm run build:shared
npm run build:backend
```

## 🏗️ Architecture

### Structure du Projet
```
oracle-portfolio-v4.1/
├── packages/
│   ├── shared/          # Types et utilitaires partagés
│   ├── backend/         # API Express + Prisma
│   └── frontend/        # Application Next.js
├── scripts/             # Scripts d'installation
├── docs/               # Documentation
└── tests/              # Tests automatisés
```

### Stack Technologique
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js 20, Express 4, Prisma 5, PostgreSQL
- **Partagé**: TypeScript, Zod pour la validation

## 🎯 Fonctionnalités

### MVP v4.1
- ✅ Détection automatique des régimes économiques (4 régimes)
- ✅ Allocation sectorielle optimisée (8 secteurs)
- ✅ Dashboard en temps réel avec historique
- ✅ API RESTful complète
- ✅ Interface utilisateur moderne et responsive
- ✅ Système de logging et analytics

### Régimes Économiques
- **Expansion**: Croissance > 2%, Inflation < 2.5%
- **Reprise**: Croissance 1-2%, Inflation < 2%
- **Stagflation**: Croissance < 1%, Inflation > 3%
- **Récession**: Croissance < 0%, Inflation < 2%

### Secteurs Supportés
- Technology, Energy, Finance, Consumer
- Healthcare, Utilities, Materials, Industrials

## 🔧 Développement

### Scripts Disponibles
```bash
# Développement
npm run dev              # Démarre frontend + backend
npm run dev:frontend     # Frontend uniquement
npm run dev:backend      # Backend uniquement

# Build
npm run build           # Build complet
npm run build:shared    # Build module partagé
npm run build:frontend  # Build frontend
npm run build:backend   # Build backend

# Tests
npm test               # Tests complets
npm run test:frontend  # Tests frontend
npm run test:backend   # Tests backend

# Linting
npm run lint           # Lint complet
npm run lint:frontend  # Lint frontend
npm run lint:backend   # Lint backend
```

### API Endpoints

#### Régimes Économiques
```
GET  /api/v1/regimes/current
GET  /api/v1/regimes/history?days=30
GET  /api/v1/regimes/analysis
POST /api/v1/regimes/detect
```

#### Allocations
```
GET  /api/v1/allocations/:regime
POST /api/v1/allocations/optimize
GET  /api/v1/allocations/compare
GET  /api/v1/allocations/performance
```

#### Secteurs
```
GET  /api/v1/sectors
GET  /api/v1/sectors/:sector
GET  /api/v1/sectors/:sector/indicators
GET  /api/v1/sectors/:sector/performance
```

#### Analytics
```
POST /api/v1/analytics/feedback
GET  /api/v1/analytics/dashboard
GET  /api/v1/analytics/usage
GET  /api/v1/analytics/performance
```

## 📊 Utilisation

### Dashboard Principal
1. Accéder à `http://localhost:3000`
2. Sélectionner le pays et la période
3. Visualiser le régime économique actuel
4. Consulter l'allocation sectorielle recommandée
5. Analyser l'historique des régimes

### API REST
1. Backend disponible sur `http://localhost:3001`
2. Documentation des endpoints dans le code
3. Health check: `http://localhost:3001/health`

## 🔍 Monitoring

### Logs
- Backend: `packages/backend/logs/`
- Rotation automatique des fichiers
- Niveaux: info, warn, error

### Métriques
- Analytics intégrés
- Performance des régimes
- Utilisation de l'API

## 🚀 Déploiement

### Production
```bash
# Build de production
npm run build

# Démarrage
npm start
```

### Docker
```bash
# Build de l'image
docker build -t oracle-portfolio .

# Démarrage
docker-compose up -d
```

## 📝 Prochaines Étapes

### v4.2 (Q2 2025)
- 🔔 Alertes push/email
- 📱 Application mobile PWA
- 🌍 Support multi-pays
- 🔗 API publique

### v5.0 (Q3 2025)
- 🤖 IA pour prédiction des régimes
- 💰 Intégration brokers
- 📊 Backtesting avancé
- 🎮 Gamification

## 🆘 Support

- 📧 Email: support@oracleportfolio.com
- 📖 Documentation: [docs.oracleportfolio.com](https://docs.oracleportfolio.com)
- 🐛 Issues: [GitHub Issues](https://github.com/oracle-portfolio/v4.1/issues)

---

**Oracle Portfolio v4.1** - Allocation sectorielle intelligente pour l'ère des régimes économiques 