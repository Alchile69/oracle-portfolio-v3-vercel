# Architecture Technique - Oracle Portfolio v4.1

## Vue d'ensemble

Oracle Portfolio v4.1 utilise une architecture modulaire permettant l'ajout facile de nouveaux secteurs et fonctionnalités tout en maintenant une scalabilité optimale.

## Architecture Modulaire

### Structure des Modules

#### Module Secteur
Chaque secteur est un module indépendant avec:
- Service de collecte de données
- Validateurs spécifiques
- Indicateurs personnalisés

```typescript
// Exemple: Ajouter un nouveau secteur
// 1. Créer le module
// packages/backend/src/modules/sectors/utilities/

// 2. Implémenter le service
export class UtilitiesService implements ISectorService {
  indicators = ['electricity_demand', 'regulatory_changes', 'weather_impact'];
  
  async collectData(): Promise<SectorData> {
    // Logique de collecte
  }
  
  async validateData(data: any): Promise<boolean> {
    // Validation spécifique
  }
}

// 3. Enregistrer dans le registry
SectorRegistry.register('utilities', new UtilitiesService());
```

## API Design

### Endpoints RESTful

```
GET  /api/v1/regimes/current
GET  /api/v1/regimes/history?days=30
GET  /api/v1/allocations/:regime
GET  /api/v1/sectors
GET  /api/v1/sectors/:sector/indicators
POST /api/v1/feedback
GET  /api/v1/export?format=csv&period=90
```

### Rate Limiting
- Standard: 100 req/15min
- Auth: 5 req/15min
- Export: 10 req/hour

## Base de Données

### Schema Principal

```sql
-- Régimes
regimes (id, country, regime, detected_at, growth_score, inflation_score)

-- Données Sectorielles
sector_data (id, sector, indicator_name, value, date, source)

-- Allocations
allocations_history (id, regime, allocations, valid_from, valid_to)

-- Audit
audit_logs (id, timestamp, user_id, action, resource, details, result)

-- Analytics
analytics_events (id, name, properties, timestamp, user_id, session_id)
```

### Optimisations
- Index sur dates pour requêtes temporelles
- Partitioning par mois pour sector_data
- Archivage automatique > 1 an

## Sécurité

### Authentication/Authorization
- JWT tokens (15min access, 7d refresh)
- Rate limiting par IP et user
- CORS configuration stricte

### Data Protection
- Encryption at rest (AES-256)
- TLS 1.3 pour transit
- Backup chiffré quotidien

## Monitoring

### Métriques Collectées
- Response time (p50, p95, p99)
- Error rate par endpoint
- Database query time
- Data freshness par secteur

### Alertes Configurées
- API down > 1 minute
- Error rate > 5%
- Data stale > 48h
- Disk usage > 80%

## Guide de Déploiement

### Prérequis
- Ubuntu 22.04 LTS
- Node.js 20+
- PostgreSQL 15+
- Nginx 1.24+
- 16GB RAM minimum

### Installation
```bash
# Clone repository
git clone https://github.com/oracle-portfolio/v4.1.git
cd oracle-portfolio-v4.1

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Configuration
- Éditer .env avec vos valeurs
- Configurer les API keys (Yahoo, FRED)
- Ajuster les domaines dans Nginx
- Configurer les backups S3/Storage

### Mise en Production
```bash
# Build et deploy
./scripts/deploy.sh production main

# Vérifier le statut
pm2 status
pm2 logs

# Monitoring
pm2 monit
```

## Troubleshooting

### Problèmes Fréquents

**"Data collection failed"**
- Vérifier les API keys
- Vérifier la connectivité réseau
- Consulter les logs: `pm2 logs oracle-backend`

**"High memory usage"**
- Vérifier les memory leaks: `pm2 show oracle-backend`
- Augmenter la limite: `pm2 set oracle-backend:max_memory_restart 2G`

**"Regime detection unstable"**
- Vérifier la qualité des données
- Ajuster MINIMUM_PERSISTENCE_DAYS
- Analyser la matrice de confusion

### Logs et Debugging

**Emplacement des logs**
- Application: `/opt/oracle-portfolio/logs/`
- Nginx: `/var/log/nginx/`
- PostgreSQL: `/var/log/postgresql/`

**Commandes utiles**
```bash
# Tail logs en temps réel
pm2 logs --lines 100

# Analyser les erreurs
grep ERROR /opt/oracle-portfolio/logs/backend-error.log | tail -50

# Vérifier la santé
curl http://localhost:3001/health
```

## Évolution vers v2

### Fonctionnalités Planifiées
- 4 secteurs supplémentaires
- Données intraday (horaire)
- Alertes push/email
- API publique
- Application mobile

### Préparation Code
- Interfaces définies pour nouveaux secteurs
- Websocket structure en place
- Analytics events prêts pour gamification
- A/B testing framework intégré 