-- Script d'initialisation de la base de données Oracle Portfolio
-- Ce script est exécuté automatiquement lors du premier démarrage du conteneur PostgreSQL

-- Créer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Créer les schémas
CREATE SCHEMA IF NOT EXISTS oracle_portfolio;

-- Configurer les paramètres de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Redémarrer pour appliquer les changements
SELECT pg_reload_conf();

-- Créer les tables de base (seront remplacées par Prisma)
CREATE TABLE IF NOT EXISTS oracle_portfolio.regimes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country VARCHAR(3) NOT NULL,
    regime VARCHAR(20) NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    growth_score DECIMAL(5,2),
    inflation_score DECIMAL(5,2),
    confidence DECIMAL(3,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oracle_portfolio.sector_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sector VARCHAR(50) NOT NULL,
    indicator_name VARCHAR(100) NOT NULL,
    value DECIMAL(15,6),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(50),
    quality_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oracle_portfolio.allocations_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    regime VARCHAR(20) NOT NULL,
    allocations JSONB NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_to TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oracle_portfolio.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID,
    session_id VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100),
    details JSONB,
    ip VARCHAR(45),
    user_agent TEXT,
    result VARCHAR(20) NOT NULL,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS oracle_portfolio.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    properties JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID,
    session_id VARCHAR(100) NOT NULL
);

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_regimes_country_detected_at ON oracle_portfolio.regimes(country, detected_at);
CREATE INDEX IF NOT EXISTS idx_regimes_is_active ON oracle_portfolio.regimes(is_active);
CREATE INDEX IF NOT EXISTS idx_sector_data_sector_date ON oracle_portfolio.sector_data(sector, date);
CREATE INDEX IF NOT EXISTS idx_sector_data_indicator ON oracle_portfolio.sector_data(indicator_name);
CREATE INDEX IF NOT EXISTS idx_allocations_regime_valid_from ON oracle_portfolio.allocations_history(regime, valid_from);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON oracle_portfolio.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON oracle_portfolio.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_timestamp ON oracle_portfolio.analytics_events(name, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON oracle_portfolio.analytics_events(session_id);

-- Créer les vues pour simplifier les requêtes
CREATE OR REPLACE VIEW oracle_portfolio.current_regime AS
SELECT * FROM oracle_portfolio.regimes 
WHERE is_active = true 
ORDER BY detected_at DESC 
LIMIT 1;

CREATE OR REPLACE VIEW oracle_portfolio.latest_sector_data AS
SELECT DISTINCT ON (sector, indicator_name) 
    sector, indicator_name, value, date, source, quality_score
FROM oracle_portfolio.sector_data 
ORDER BY sector, indicator_name, date DESC;

-- Créer les fonctions utilitaires
CREATE OR REPLACE FUNCTION oracle_portfolio.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer les triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_regimes_updated_at 
    BEFORE UPDATE ON oracle_portfolio.regimes 
    FOR EACH ROW EXECUTE FUNCTION oracle_portfolio.update_updated_at_column();

-- Créer les fonctions pour les statistiques
CREATE OR REPLACE FUNCTION oracle_portfolio.get_regime_statistics(days INTEGER DEFAULT 30)
RETURNS TABLE (
    regime VARCHAR(20),
    count BIGINT,
    avg_duration DECIMAL(10,2),
    total_duration DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.regime,
        COUNT(*) as count,
        AVG(EXTRACT(EPOCH FROM (LEAD(r.detected_at) OVER (PARTITION BY r.country ORDER BY r.detected_at) - r.detected_at)) / 86400) as avg_duration,
        SUM(EXTRACT(EPOCH FROM (LEAD(r.detected_at) OVER (PARTITION BY r.country ORDER BY r.detected_at) - r.detected_at)) / 86400) as total_duration
    FROM oracle_portfolio.regimes r
    WHERE r.detected_at >= NOW() - INTERVAL '1 day' * days
    GROUP BY r.regime;
END;
$$ LANGUAGE plpgsql;

-- Créer les fonctions pour les métriques de performance
CREATE OR REPLACE FUNCTION oracle_portfolio.get_data_freshness()
RETURNS TABLE (
    sector VARCHAR(50),
    last_update TIMESTAMP WITH TIME ZONE,
    age_hours DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sd.sector,
        MAX(sd.date) as last_update,
        EXTRACT(EPOCH FROM (NOW() - MAX(sd.date))) / 3600 as age_hours
    FROM oracle_portfolio.sector_data sd
    GROUP BY sd.sector;
END;
$$ LANGUAGE plpgsql;

-- Insérer des données de test (optionnel)
INSERT INTO oracle_portfolio.regimes (country, regime, growth_score, inflation_score, confidence) VALUES
('FRA', 'EXPANSION', 2.5, 1.8, 0.85),
('DEU', 'RECOVERY', 1.2, 1.5, 0.78),
('USA', 'STAGFLATION', 0.8, 4.2, 0.92),
('GBR', 'RECESSION', -0.5, 1.2, 0.88)
ON CONFLICT DO NOTHING;

-- Donner les permissions nécessaires
GRANT ALL PRIVILEGES ON SCHEMA oracle_portfolio TO oracle_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA oracle_portfolio TO oracle_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA oracle_portfolio TO oracle_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA oracle_portfolio TO oracle_user;

-- Configurer les permissions pour les futures tables
ALTER DEFAULT PRIVILEGES IN SCHEMA oracle_portfolio GRANT ALL ON TABLES TO oracle_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA oracle_portfolio GRANT ALL ON SEQUENCES TO oracle_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA oracle_portfolio GRANT EXECUTE ON FUNCTIONS TO oracle_user; 