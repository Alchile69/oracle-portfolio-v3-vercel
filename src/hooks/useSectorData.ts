/**
 * Hook useSectorData - Gestion des données sectorielles Oracle Portfolio V3.0
 * @author Manus AI
 * @version 3.0.0
 * @date 2025-08-07
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SectorData, 
  SectorType, 
  SectorMetrics,
  SECTOR_DEFINITIONS,
  SectorUtils,
  TrendDirection,
  SectorGrade,
  UseSectorDataReturn,
  DEFAULT_SECTOR_CONFIG
} from '../types/sector.types';

// Interface pour la configuration du hook
interface UseSectorDataConfig {
  refreshInterval?: number;
  autoRefresh?: boolean;
  enableCache?: boolean;
  fallbackData?: boolean;
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
      performance: 8.1,
      confidence: 78,
      trend: TrendDirection.STABLE,
      riskScore: 65,
      volatility: 15.8,
      sharpeRatio: 1.12,
      beta: 0.95,
      lastUpdated: new Date()
    },
    grade: SectorGrade.B,
    recommendations: [
      'Secteur stable avec dividendes',
      'Bon équilibre risque/rendement',
      'Surveiller les taux d\'intérêt'
    ],
    historicalData: []
  },
  {
    metadata: SECTOR_DEFINITIONS[SectorType.HEALTHCARE],
    metrics: {
      allocation: 15.2,
      performance: 6.8,
      confidence: 82,
      trend: TrendDirection.UP,
      riskScore: 45,
      volatility: 12.1,
      sharpeRatio: 1.28,
      beta: 0.75,
      lastUpdated: new Date()
    },
    grade: SectorGrade.B,
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
      'E-commerce en croissance',
      'Changements comportementaux',
      'Marques fortes privilégiées'
    ],
    historicalData: []
  },
  {
    metadata: SECTOR_DEFINITIONS[SectorType.COMMUNICATION],
    metrics: {
      allocation: 5.3,
      performance: 7.8,
      confidence: 68,
      trend: TrendDirection.UP,
      riskScore: 72,
      volatility: 19.1,
      sharpeRatio: 1.15,
      beta: 1.05,
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
      allocation: 2.1,
      performance: -1.2,
      confidence: 58,
      trend: TrendDirection.DOWN,
      riskScore: 80,
      volatility: 22.5,
      sharpeRatio: 0.45,
      beta: 1.35,
      lastUpdated: new Date()
    },
    grade: SectorGrade.D,
    recommendations: [
      'Cyclique et sensible aux commodités',
      'Transition vers matériaux durables',
      'Volatilité élevée'
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
    refreshInterval = DEFAULT_SECTOR_CONFIG.refreshInterval,
    autoRefresh = true,
    enableCache = true,
    fallbackData = true
  } = config;

  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Cache des données
  const [cache, setCache] = useState<Map<string, { data: SectorData[]; timestamp: Date }>>(new Map());

  // Fonction pour récupérer les données depuis l'API
  const fetchSectorData = useCallback(async (): Promise<SectorData[]> => {
    try {
      // Vérifier le cache si activé
      if (enableCache) {
        const cacheKey = 'sector-data';
        const cachedData = cache.get(cacheKey);
        if (cachedData && Date.now() - cachedData.timestamp.getTime() < refreshInterval) {
          return cachedData.data;
        }
      }

      // Simulation d'appel API - À remplacer par l'appel réel
      const response = await fetch('/api/sectors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validation des données
      const validatedData = data.sectors.filter((sector: SectorData) => 
        SectorUtils.validateSectorData(sector)
      );

      // Mise à jour du cache
      if (enableCache) {
        setCache(prev => new Map(prev.set('sector-data', {
          data: validatedData,
          timestamp: new Date()
        })));
      }

      return validatedData;
    } catch (apiError) {
      console.warn('Erreur lors de la récupération des données sectorielles:', apiError);
      
      // Utiliser les données de fallback si activées
      if (fallbackData) {
        console.info('Utilisation des données de fallback sectorielles');
        return FALLBACK_SECTOR_DATA;
      }
      
      throw apiError;
    }
  }, [cache, enableCache, refreshInterval, fallbackData]);

  // Fonction pour rafraîchir les données
  const refetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchSectorData();
      setSectors(data);
      setLastFetch(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors du rafraîchissement des données sectorielles:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchSectorData]);

  // Fonction pour mettre à jour un secteur spécifique
  const updateSector = useCallback(async (
    sectorId: SectorType, 
    data: Partial<SectorMetrics>
  ): Promise<void> => {
    try {
      // Simulation d'appel API pour mise à jour - À remplacer par l'appel réel
      const response = await fetch(`/api/sectors/${sectorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour: ${response.status}`);
      }

      // Mise à jour locale des données
      setSectors(prevSectors => 
        prevSectors.map(sector => 
          sector.metadata.id === sectorId 
            ? {
                ...sector,
                metrics: { ...sector.metrics, ...data, lastUpdated: new Date() },
                grade: SectorUtils.calculateGrade(data.performance ?? sector.metrics.performance)
              }
            : sector
        )
      );

      // Invalider le cache
      if (enableCache) {
        setCache(prev => {
          const newCache = new Map(prev);
          newCache.delete('sector-data');
          return newCache;
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de mise à jour';
      setError(errorMessage);
      throw err;
    }
  }, [enableCache]);

  // Chargement initial des données
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Auto-refresh si activé
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!loading) {
        refetch();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading, refetch]);

  // Mémorisation des données triées et enrichies
  const enrichedSectors = useMemo(() => {
    return sectors.map(sector => ({
      ...sector,
      grade: SectorUtils.calculateGrade(sector.metrics.performance),
      metadata: {
        ...sector.metadata,
        ...SECTOR_DEFINITIONS[sector.metadata.id]
      }
    }));
  }, [sectors]);

  return {
    sectors: enrichedSectors,
    loading,
    error,
    refetch,
    updateSector
  };
};

/**
 * Hook pour les statistiques sectorielles agrégées
 */
export const useSectorStats = (sectors: SectorData[]) => {
  return useMemo(() => {
    if (!sectors.length) {
      return {
        totalAllocation: 0,
        averagePerformance: 0,
        averageRisk: 0,
        averageConfidence: 0,
        topPerformer: null,
        worstPerformer: null,
        diversificationScore: 0,
        gradeDistribution: {},
        riskDistribution: {}
      };
    }

    const totalAllocation = sectors.reduce((sum, sector) => sum + sector.metrics.allocation, 0);
    const averagePerformance = sectors.reduce((sum, sector) => sum + sector.metrics.performance, 0) / sectors.length;
    const averageRisk = sectors.reduce((sum, sector) => sum + sector.metrics.riskScore, 0) / sectors.length;
    const averageConfidence = sectors.reduce((sum, sector) => sum + sector.metrics.confidence, 0) / sectors.length;
    
    const topPerformer = sectors.reduce((best, current) => 
      current.metrics.performance > best.metrics.performance ? current : best
    );
    
    const worstPerformer = sectors.reduce((worst, current) => 
      current.metrics.performance < worst.metrics.performance ? current : worst
    );

    const diversificationScore = SectorUtils.calculateDiversificationScore(
      sectors.map(sector => ({
        sectorId: sector.metadata.id,
        allocation: sector.metrics.allocation
      }))
    );

    const gradeDistribution = sectors.reduce((acc, sector) => {
      acc[sector.grade] = (acc[sector.grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const riskDistribution = sectors.reduce((acc, sector) => {
      acc[sector.metadata.riskLevel] = (acc[sector.metadata.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAllocation,
      averagePerformance,
      averageRisk,
      averageConfidence,
      topPerformer,
      worstPerformer,
      diversificationScore,
      gradeDistribution,
      riskDistribution
    };
  }, [sectors]);
};

export default useSectorData;

