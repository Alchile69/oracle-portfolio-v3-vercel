/**
 * Hook useSectorData - Gestion des données sectorielles Oracle Portfolio V3.0
 * @author Manus AI
 * @version 3.0.0
 * @date 2025-08-07
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  SectorData, 
  SectorType, 
  SECTOR_DEFINITIONS,
  TrendDirection,
  SectorGrade
} from '../types/sector.types';

// Interface pour la configuration du hook
interface UseSectorDataConfig {
  refreshInterval?: number;
  autoRefresh?: boolean;
  enableCache?: boolean;
  fallbackData?: boolean;
}

// Interface de retour du hook
interface UseSectorDataReturn {
  sectors: SectorData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastFetch: Date | null;
}

// Données de fallback pour les tests et le développement
const FALLBACK_SECTOR_DATA: SectorData[] = [
  {
    metadata: SECTOR_DEFINITIONS[SectorType.TECHNOLOGY],
    metrics: {
      allocation: 25.5,
      performance: 12.3,
      confidence: 85,
      trend: TrendDirection.UP,
      riskScore: 75,
      volatility: 18.2,
      sharpeRatio: 1.45,
      beta: 1.2,
      lastUpdated: new Date()
    },
    grade: SectorGrade.A,
    recommendations: [
      'Secteur en forte croissance avec l\'IA',
      'Maintenir allocation élevée',
      'Surveiller la volatilité'
    ],
    historicalData: []
  },
  {
    metadata: SECTOR_DEFINITIONS[SectorType.FINANCE],
    metrics: {
      allocation: 18.7,
      performance: 8.9,
      confidence: 78,
      trend: TrendDirection.UP,
      riskScore: 65,
      volatility: 15.4,
      sharpeRatio: 1.15,
      beta: 1.05,
      lastUpdated: new Date()
    },
    grade: SectorGrade.B,
    recommendations: [
      'Taux d\'intérêt favorables',
      'Digitalisation bancaire',
      'Fintech en expansion'
    ],
    historicalData: []
  },
  {
    metadata: SECTOR_DEFINITIONS[SectorType.HEALTHCARE],
    metrics: {
      allocation: 15.2,
      performance: 6.8,
      confidence: 82,
      trend: TrendDirection.STABLE,
      riskScore: 45,
      volatility: 12.1,
      sharpeRatio: 1.28,
      beta: 0.75,
      lastUpdated: new Date()
    },
    grade: SectorGrade.A,
    recommendations: [
      'Secteur défensif stable',
      'Vieillissement démographique favorable',
      'Innovation biotechnologique'
    ],
    historicalData: []
  },
  {
    metadata: SECTOR_DEFINITIONS[SectorType.ENERGY],
    metrics: {
      allocation: 12.1,
      performance: -2.5,
      confidence: 65,
      trend: TrendDirection.DOWN,
      riskScore: 85,
      volatility: 25.3,
      sharpeRatio: 0.65,
      beta: 1.45,
      lastUpdated: new Date()
    },
    grade: SectorGrade.C,
    recommendations: [
      'Transition énergétique en cours',
      'Volatilité élevée des prix',
      'Considérer les énergies renouvelables'
    ],
    historicalData: []
  },
  {
    metadata: SECTOR_DEFINITIONS[SectorType.INDUSTRIALS],
    metrics: {
      allocation: 10.8,
      performance: 5.2,
      confidence: 72,
      trend: TrendDirection.STABLE,
      riskScore: 70,
      volatility: 16.7,
      sharpeRatio: 0.95,
      beta: 1.1,
      lastUpdated: new Date()
    },
    grade: SectorGrade.B,
    recommendations: [
      'Secteur cyclique sensible à l\'économie',
      'Automatisation et robotique',
      'Infrastructure et transport'
    ],
    historicalData: []
  },
  {
    metadata: SECTOR_DEFINITIONS[SectorType.CONSUMER],
    metrics: {
      allocation: 8.9,
      performance: 4.1,
      confidence: 75,
      trend: TrendDirection.STABLE,
      riskScore: 60,
      volatility: 14.2,
      sharpeRatio: 1.05,
      beta: 0.9,
      lastUpdated: new Date()
    },
    grade: SectorGrade.B,
    recommendations: [
      'Consommation résiliente',
      'E-commerce en croissance',
      'Marques premium favorisées'
    ],
    historicalData: []
  },
  {
    metadata: SECTOR_DEFINITIONS[SectorType.COMMUNICATION],
    metrics: {
      allocation: 7.3,
      performance: 3.8,
      confidence: 70,
      trend: TrendDirection.STABLE,
      riskScore: 55,
      volatility: 13.6,
      sharpeRatio: 0.88,
      beta: 0.95,
      lastUpdated: new Date()
    },
    grade: SectorGrade.B,
    recommendations: [
      '5G et infrastructure réseau',
      'Streaming et contenu digital',
      'Consolidation du secteur'
    ],
    historicalData: []
  },
  {
    metadata: SECTOR_DEFINITIONS[SectorType.MATERIALS],
    metrics: {
      allocation: 5.4,
      performance: 1.2,
      confidence: 68,
      trend: TrendDirection.DOWN,
      riskScore: 80,
      volatility: 22.1,
      sharpeRatio: 0.45,
      beta: 1.35,
      lastUpdated: new Date()
    },
    grade: SectorGrade.C,
    recommendations: [
      'Cyclique dépendant de l\'économie',
      'Matériaux verts en développement',
      'Volatilité des prix des commodités'
    ],
    historicalData: []
  },
  {
    metadata: SECTOR_DEFINITIONS[SectorType.SERVICES],
    metrics: {
      allocation: 4.1,
      performance: 2.9,
      confidence: 73,
      trend: TrendDirection.STABLE,
      riskScore: 50,
      volatility: 11.8,
      sharpeRatio: 0.92,
      beta: 0.85,
      lastUpdated: new Date()
    },
    grade: SectorGrade.B,
    recommendations: [
      'Digitalisation des services',
      'Logistique et e-commerce',
      'Services aux entreprises'
    ],
    historicalData: []
  },
  {
    metadata: SECTOR_DEFINITIONS[SectorType.REAL_ESTATE],
    metrics: {
      allocation: 3.8,
      performance: 0.8,
      confidence: 65,
      trend: TrendDirection.DOWN,
      riskScore: 75,
      volatility: 19.4,
      sharpeRatio: 0.35,
      beta: 1.25,
      lastUpdated: new Date()
    },
    grade: SectorGrade.D,
    recommendations: [
      'Taux d\'intérêt défavorables',
      'Télétravail impact commercial',
      'REITs résidentiels plus stables'
    ],
    historicalData: []
  },
  {
    metadata: SECTOR_DEFINITIONS[SectorType.UTILITIES],
    metrics: {
      allocation: 1.4,
      performance: 3.2,
      confidence: 88,
      trend: TrendDirection.STABLE,
      riskScore: 35,
      volatility: 8.9,
      sharpeRatio: 1.35,
      beta: 0.6,
      lastUpdated: new Date()
    },
    grade: SectorGrade.A,
    recommendations: [
      'Secteur défensif avec dividendes',
      'Transition énergétique',
      'Régulation stable'
    ],
    historicalData: []
  }
];

/**
 * Hook personnalisé pour la gestion des données sectorielles
 */
export const useSectorData = (config: UseSectorDataConfig = {}): UseSectorDataReturn => {
  const {
    refreshInterval = 300000, // 5 minutes
    autoRefresh = true,
    fallbackData = true
  } = config;

  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fonction pour charger les données (utilise uniquement les données de fallback)
  const loadSectorData = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulation d'un délai de chargement
      setTimeout(() => {
        setSectors(FALLBACK_SECTOR_DATA);
        setLastFetch(new Date());
        setLoading(false);
      }, 500);
      
    } catch (err) {
      console.error('Erreur lors du chargement des données sectorielles:', err);
      setError('Erreur lors du chargement des données');
      setLoading(false);
      
      // Utiliser les données de fallback en cas d'erreur
      if (fallbackData) {
        setSectors(FALLBACK_SECTOR_DATA);
      }
    }
  }, [fallbackData]);

  // Fonction de refetch
  const refetch = useCallback(() => {
    loadSectorData();
  }, [loadSectorData]);

  // Chargement initial
  useEffect(() => {
    loadSectorData();
  }, [loadSectorData]);

  // Auto-refresh si activé
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      loadSectorData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadSectorData]);

  return {
    sectors,
    loading,
    error,
    refetch,
    lastFetch
  };
};

