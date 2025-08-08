/**
 * Hook useSectorData - Données sectorielles Oracle Portfolio V3.0
 * Avec gestion d'erreurs robuste et fallback automatique
 */

import { useState, useEffect } from 'react';
import { 
  SectorData, 
  SectorType, 
  SECTOR_DEFINITIONS,
  TrendDirection,
  SectorGrade
} from '../types/sector.types';

interface UseSectorDataReturn {
  sectors: SectorData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastFetch: Date | null;
}

// Données de fallback complètes
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

// Fonction pour valider si une réponse est du JSON valide
const isValidJSON = (text: string): boolean => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

export const useSectorData = (): UseSectorDataReturn => {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Tentative de récupération des données sectorielles...');
      
      const response = await fetch('/api/sectors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      if (response.ok) {
        const responseText = await response.text();
        
        // Vérifier si la réponse est du JSON valide
        if (!isValidJSON(responseText)) {
          throw new Error(`Réponse invalide: reçu HTML au lieu de JSON. Contenu: ${responseText.substring(0, 100)}...`);
        }
        
        const data = JSON.parse(responseText);
        
        // Vérifier la structure des données
        if (!data.sectors || !Array.isArray(data.sectors)) {
          throw new Error('Structure de données invalide: propriété "sectors" manquante ou invalide');
        }

        // Convertir les données API vers le format SectorData
        const convertedSectors: SectorData[] = data.sectors.map((sector: any) => ({
          metadata: {
            id: sector.metadata.id,
            name: sector.metadata.name,
            description: sector.metadata.description,
            category: sector.metadata.category,
            riskLevel: sector.metadata.riskLevel
          },
          metrics: {
            allocation: sector.metrics.allocation,
            performance: sector.metrics.performance,
            confidence: sector.metrics.confidence,
            trend: sector.metrics.trend as TrendDirection,
            riskScore: sector.metrics.riskScore,
            volatility: sector.metrics.volatility,
            sharpeRatio: sector.metrics.sharpeRatio,
            beta: sector.metrics.beta,
            lastUpdated: new Date(sector.metrics.lastUpdated)
          },
          grade: sector.grade as SectorGrade,
          recommendations: sector.recommendations,
          historicalData: sector.historicalData || []
        }));

        setSectors(convertedSectors);
        setLastFetch(new Date());
        console.log('✅ Données sectorielles chargées depuis l\'API avec succès');
        
      } else {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.warn('⚠️ Erreur lors de la récupération des données sectorielles:', errorMessage);
      console.log('🔄 Utilisation des données de fallback sectorielles');
      
      // Utiliser les données de fallback
      setSectors(FALLBACK_SECTOR_DATA);
      setLastFetch(new Date());
      setError(`API indisponible: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    sectors,
    loading,
    error,
    refetch,
    lastFetch
  };
};

