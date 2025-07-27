# Oracle Portfolio v4.1

Application web modulaire et évolutive d'allocation sectorielle basée sur les régimes économiques, conçue pour valider rapidement le concept avec 100 utilisateurs beta tout en préparant l'infrastructure pour une croissance rapide vers 1000+ utilisateurs payants.

## 🚀 Installation Rapide

### Prérequis
- Node.js 20+
- PostgreSQL 15+
- Ubuntu 22.04 LTS (recommandé)

### Installation One-Click
```bash
git clone https://github.com/oracle-portfolio/v4.1.git
cd oracle-portfolio-v4.1
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Installation Manuelle
```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp env.example .env
# Éditer .env avec vos valeurs

# 3. Configurer la base de données
cd packages/backend
npx prisma migrate deploy
npx prisma db seed
cd ../..

# 4. Build et démarrage
npm run build
npm run dev
```

## 🏗️ Architecture

### Stack Technologique
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand
- **Backend**: Node.js 20, Express 4, Prisma 5, PostgreSQL
- **Infrastructure**: Nginx, PM2, Let's Encrypt, Prometheus

### Structure Modulaire
```
/oracle-portfolio-v4.1
├── /packages
│   ├── /shared          # Types et utilitaires partagés
│   ├── /frontend        # Application Next.js
│   └── /backend         # API Express
├── /scripts             # Scripts d'installation et déploiement
├── /docs               # Documentation technique
└── /tests              # Tests automatisés
```

## 🎯 Fonctionnalités

### MVP v4.1
- ✅ Détection automatique des régimes économiques (4 régimes)
- ✅ Allocation sectorielle optimisée (8 secteurs)
- ✅ Dashboard en temps réel avec historique
- ✅ Export des données (CSV/JSON)
- ✅ Mode démo pour acquisition utilisateurs
- ✅ Feedback intégré et analytics

### Sécurité et Fiabilité
- 🔒 Audit trail complet
- 🛡️ Rate limiting et protection DDoS
- 💾 Backups automatiques chiffrés
- 📊 Monitoring de fraîcheur des données
- 🔄 Fallback multi-niveaux (Yahoo → FRED → Cache)

### Interface Utilisateur
- 📱 Design responsive mobile-first
- 🎨 Interface moderne avec animations
- 📈 Visualisations interactives
- 🔍 Explications intégrées
- ⚡ Performance optimisée

## 📊 Régimes Économiques

| Régime | Croissance | Inflation | Secteurs Favorisés |
|--------|------------|-----------|-------------------|
| **Expansion** | > 2% | < 2.5% | Tech, Consommation, Industriels |
| **Reprise** | 1-2% | < 2% | Finance, Matériaux, Services |
| **Stagflation** | < 1% | > 3% | Énergie, Services, Santé |
| **Récession** | < 0% | < 2% | Services, Santé, Consommation |

## 🛠️ Développement

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

### Ajouter un Nouveau Secteur
1. Créer le module dans `packages/backend/src/modules/sectors/`
2. Implémenter le service de collecte de données
3. Ajouter les types dans `packages/shared/src/types/`
4. Mettre à jour les constantes et allocations

## 🚀 Déploiement

### Production
```bash
# Installation complète
./scripts/setup.sh

# Déploiement automatisé
./scripts/deploy.sh production main

# Monitoring
pm2 monit
pm2 logs
```

### Configuration Production
- **Serveur**: VPS Hetzner CX41 (16GB RAM, 4 vCPU)
- **OS**: Ubuntu 22.04 LTS
- **Base de données**: PostgreSQL 15
- **Proxy**: Nginx 1.24 avec SSL
- **Process Manager**: PM2 en mode cluster

## 📈 Roadmap

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

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

- 📧 Email: support@oracleportfolio.com
- 📖 Documentation: [docs.oracleportfolio.com](https://docs.oracleportfolio.com)
- 🐛 Issues: [GitHub Issues](https://github.com/oracle-portfolio/v4.1/issues)

---

**Oracle Portfolio v4.1** - Allocation sectorielle intelligente pour l'ère des régimes économiques 