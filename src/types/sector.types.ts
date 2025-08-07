/**
 * Types et définitions pour les secteurs d'activité Oracle Portfolio V3.0
 * @author Manus AI
 * @version 3.0.0
 * @date 2025-08-07
 */

// Énumération des secteurs d'activité
export enum SectorType {
  TECHNOLOGY = 'technology',
  FINANCE = 'finance',
  HEALTHCARE = 'healthcare',
  ENERGY = 'energy',
  INDUSTRIALS = 'industrials',
  CONSUMER = 'consumer',
  COMMUNICATION = 'communication',
  MATERIALS = 'materials',
  SERVICES = 'services',
  REAL_ESTATE = 'real_estate',
  UTILITIES = 'utilities'
}

// Niveaux de risque sectoriel
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Types de secteurs (cyclique/défensif)
export enum SectorCategory {
  CYCLICAL = 'cyclical',
  DEFENSIVE = 'defensive'
}

// Tendances sectorielles
export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable'
}

// Grades de classification A-F
export enum SectorGrade {
  A = 'A', // Excellent (90-100%)
  B = 'B', // Bon (80-89%)
  C = 'C', // Moyen (70-79%)
  D = 'D', // Faible (60-69%)
  F = 'F'  // Critique (<60%)
}

// Interface pour les métadonnées sectorielles
export interface SectorMetadata {
  id: SectorType;
  name: string;
  description: string;
  icon: string;
  color: string;
  riskLevel: RiskLevel;
  category: SectorCategory;
  subSectors: string[];
}

// Interface pour les métriques sectorielles
export interface SectorMetrics {
  allocation: number; // Pourcentage d'allocation (0-100)
  performance: number; // Performance en pourcentage
  confidence: number; // Score de confiance (0-100)
  trend: TrendDirection; // Tendance actuelle
  riskScore: number; // Score de risque (0-100)
  volatility: number; // Volatilité historique
  sharpeRatio: number; // Ratio de Sharpe sectoriel
  beta: number; // Bêta par rapport au marché
  lastUpdated: Date; // Date de dernière mise à jour
}

// Interface pour les données sectorielles complètes
export interface SectorData {
  metadata: SectorMetadata;
  metrics: SectorMetrics;
  grade: SectorGrade;
  recommendations: string[];
  historicalData: HistoricalDataPoint[];
}

// Interface pour les données historiques
export interface HistoricalDataPoint {
  date: Date;
  allocation: number;
  performance: number;
  riskScore: number;
  grade: SectorGrade;
}

// Interface pour les allocations sectorielles
export interface SectorAllocation {
  sectorId: SectorType;
  allocation: number;
  targetAllocation?: number;
  minAllocation?: number;
  maxAllocation?: number;
}

// Interface pour les recommandations d'optimisation
export interface OptimizationRecommendation {
  sectorId: SectorType;
  currentAllocation: number;
  recommendedAllocation: number;
  reason: string;
  impact: number; // Impact estimé sur la performance
  confidence: number; // Confiance dans la recommandation (0-100)
  priority: 'high' | 'medium' | 'low';
}

// Interface pour les alertes sectorielles
export interface SectorAlert {
  id: string;
  sectorId: SectorType;
  type: 'performance' | 'risk' | 'allocation' | 'trend';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

// Interface pour les comparaisons inter-sectorielles
export interface SectorComparison {
  sectors: SectorType[];
  metrics: {
    performance: number[];
    risk: number[];
    allocation: number[];
    correlation: number[][];
  };
  period: string; // '1M', '3M', '6M', '1Y'
}

// Interface pour les statistiques globales
export interface PortfolioSectorStats {
  totalSectors: number;
  averageGrade: number;
  riskDistribution: Record<RiskLevel, number>;
  gradeDistribution: Record<SectorGrade, number>;
  topPerformers: SectorType[];
  underPerformers: SectorType[];
  diversificationScore: number; // Score de diversification (0-100)
}

// Constantes pour les secteurs d'activité
export const SECTOR_DEFINITIONS: Record<SectorType, SectorMetadata> = {
  [SectorType.TECHNOLOGY]: {
    id: SectorType.TECHNOLOGY,
    name: 'Technologies',
    description: 'IT, Software, Hardware, Intelligence Artificielle',
    icon: '💻',
    color: '#3B82F6',
    riskLevel: RiskLevel.HIGH,
    category: SectorCategory.CYCLICAL,
    subSectors: ['Software', 'Hardware', 'Semiconductors', 'IT Services', 'AI/ML']
  },
  [SectorType.FINANCE]: {
    id: SectorType.FINANCE,
    name: 'Finance',
    description: 'Banque, Assurance, Investissement, Fintech',
    icon: '🏦',
    color: '#10B981',
    riskLevel: RiskLevel.MEDIUM,
    category: SectorCategory.CYCLICAL,
    subSectors: ['Banking', 'Insurance', 'Investment', 'Fintech', 'Real Estate Finance']
  },
  [SectorType.HEALTHCARE]: {
    id: SectorType.HEALTHCARE,
    name: 'Santé',
    description: 'Médical, Pharmaceutique, Biotech, Équipements médicaux',
    icon: '🏥',
    color: '#EF4444',
    riskLevel: RiskLevel.LOW,
    category: SectorCategory.DEFENSIVE,
    subSectors: ['Pharmaceuticals', 'Biotechnology', 'Medical Devices', 'Healthcare Services']
  },
  [SectorType.ENERGY]: {
    id: SectorType.ENERGY,
    name: 'Énergie',
    description: 'Pétrole, Gaz, Renouvelables, Nucléaire',
    icon: '⚡',
    color: '#F59E0B',
    riskLevel: RiskLevel.HIGH,
    category: SectorCategory.CYCLICAL,
    subSectors: ['Oil & Gas', 'Renewable Energy', 'Nuclear', 'Energy Storage']
  },
  [SectorType.INDUSTRIALS]: {
    id: SectorType.INDUSTRIALS,
    name: 'Industrie',
    description: 'Manufacture, Automobile, Aéronautique, Défense',
    icon: '🏭',
    color: '#8B5CF6',
    riskLevel: RiskLevel.MEDIUM,
    category: SectorCategory.CYCLICAL,
    subSectors: ['Manufacturing', 'Automotive', 'Aerospace', 'Defense', 'Industrial Equipment']
  },
  [SectorType.CONSUMER]: {
    id: SectorType.CONSUMER,
    name: 'Consommation',
    description: 'Retail, E-commerce, Distribution, Biens de consommation',
    icon: '🛒',
    color: '#EC4899',
    riskLevel: RiskLevel.MEDIUM,
    category: SectorCategory.CYCLICAL,
    subSectors: ['Retail', 'E-commerce', 'Consumer Goods', 'Food & Beverage']
  },
  [SectorType.COMMUNICATION]: {
    id: SectorType.COMMUNICATION,
    name: 'Communication',
    description: 'Télécom, Média, Internet, Divertissement',
    icon: '📡',
    color: '#06B6D4',
    riskLevel: RiskLevel.MEDIUM,
    category: SectorCategory.CYCLICAL,
    subSectors: ['Telecommunications', 'Media', 'Internet', 'Entertainment', 'Gaming']
  },
  [SectorType.MATERIALS]: {
    id: SectorType.MATERIALS,
    name: 'Matériaux',
    description: 'Chimie, Construction, Métaux, Mines',
    icon: '🏗️',
    color: '#84CC16',
    riskLevel: RiskLevel.HIGH,
    category: SectorCategory.CYCLICAL,
    subSectors: ['Chemicals', 'Construction Materials', 'Metals & Mining', 'Paper & Packaging']
  },
  [SectorType.SERVICES]: {
    id: SectorType.SERVICES,
    name: 'Services',
    description: 'Consulting, Transport, Logistique, Services professionnels',
    icon: '🚚',
    color: '#F97316',
    riskLevel: RiskLevel.MEDIUM,
    category: SectorCategory.CYCLICAL,
    subSectors: ['Professional Services', 'Transportation', 'Logistics', 'Consulting']
  },
  [SectorType.REAL_ESTATE]: {
    id: SectorType.REAL_ESTATE,
    name: 'Immobilier',
    description: 'Construction, Gestion immobilière, Développement',
    icon: '🏠',
    color: '#A855F7',
    riskLevel: RiskLevel.MEDIUM,
    category: SectorCategory.CYCLICAL,
    subSectors: ['Residential', 'Commercial', 'REITs', 'Construction', 'Property Management']
  },
  [SectorType.UTILITIES]: {
    id: SectorType.UTILITIES,
    name: 'Services publics',
    description: 'Eau, Électricité, Gaz, Déchets, Télécommunications',
    icon: '🔌',
    color: '#64748B',
    riskLevel: RiskLevel.LOW,
    category: SectorCategory.DEFENSIVE,
    subSectors: ['Electric Utilities', 'Water Utilities', 'Gas Utilities', 'Waste Management']
  }
};

// Fonctions utilitaires pour les secteurs
export class SectorUtils {
  /**
   * Calcule le grade basé sur la performance
   */
  static calculateGrade(performance: number): SectorGrade {
    if (performance >= 90) return SectorGrade.A;
    if (performance >= 80) return SectorGrade.B;
    if (performance >= 70) return SectorGrade.C;
    if (performance >= 60) return SectorGrade.D;
    return SectorGrade.F;
  }

  /**
   * Obtient la couleur associée à un grade
   */
  static getGradeColor(grade: SectorGrade): string {
    const colors = {
      [SectorGrade.A]: '#10B981', // Vert
      [SectorGrade.B]: '#3B82F6', // Bleu
      [SectorGrade.C]: '#F59E0B', // Orange
      [SectorGrade.D]: '#EF4444', // Rouge
      [SectorGrade.F]: '#DC2626'  // Rouge foncé
    };
    return colors[grade];
  }

  /**
   * Obtient la couleur associée à un niveau de risque
   */
  static getRiskColor(riskLevel: RiskLevel): string {
    const colors = {
      [RiskLevel.LOW]: '#10B981',    // Vert
      [RiskLevel.MEDIUM]: '#F59E0B', // Orange
      [RiskLevel.HIGH]: '#EF4444'    // Rouge
    };
    return colors[riskLevel];
  }

  /**
   * Obtient l'icône de tendance
   */
  static getTrendIcon(trend: TrendDirection): string {
    const icons = {
      [TrendDirection.UP]: '📈',
      [TrendDirection.DOWN]: '📉',
      [TrendDirection.STABLE]: '➡️'
    };
    return icons[trend];
  }

  /**
   * Calcule le score de diversification
   */
  static calculateDiversificationScore(allocations: SectorAllocation[]): number {
    const totalAllocation = allocations.reduce((sum, alloc) => sum + alloc.allocation, 0);
    if (totalAllocation === 0) return 0;

    // Calcul de l'indice de Herfindahl-Hirschman inversé
    const hhi = allocations.reduce((sum, alloc) => {
      const weight = alloc.allocation / totalAllocation;
      return sum + (weight * weight);
    }, 0);

    // Score de diversification (0-100, 100 = parfaitement diversifié)
    return Math.max(0, Math.min(100, (1 - hhi) * 100 / 0.9));
  }

  /**
   * Valide les données sectorielles
   */
  static validateSectorData(data: SectorData): boolean {
    try {
      // Vérification des métadonnées
      if (!data.metadata || !Object.values(SectorType).includes(data.metadata.id)) {
        return false;
      }

      // Vérification des métriques
      const metrics = data.metrics;
      if (!metrics || 
          metrics.allocation < 0 || metrics.allocation > 100 ||
          metrics.confidence < 0 || metrics.confidence > 100 ||
          metrics.riskScore < 0 || metrics.riskScore > 100) {
        return false;
      }

      // Vérification du grade
      if (!Object.values(SectorGrade).includes(data.grade)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Formate un pourcentage pour l'affichage
   */
  static formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Formate une valeur monétaire
   */
  static formatCurrency(value: number, currency: string = '€'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === '€' ? 'EUR' : 'USD'
    }).format(value);
  }

  /**
   * Calcule la corrélation entre deux secteurs
   */
  static calculateCorrelation(sector1Data: number[], sector2Data: number[]): number {
    if (sector1Data.length !== sector2Data.length || sector1Data.length === 0) {
      return 0;
    }

    const n = sector1Data.length;
    const mean1 = sector1Data.reduce((sum, val) => sum + val, 0) / n;
    const mean2 = sector2Data.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = sector1Data[i] - mean1;
      const diff2 = sector2Data[i] - mean2;
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    return denominator === 0 ? 0 : numerator / denominator;
  }
}

// Types pour l'API Firebase
export interface FirebaseSectorData {
  sectors: Record<string, SectorData>;
  lastUpdated: string;
  version: string;
}

export interface SectorUpdatePayload {
  sectorId: SectorType;
  metrics: Partial<SectorMetrics>;
  timestamp: string;
}

// Types pour les hooks React
export interface UseSectorDataReturn {
  sectors: SectorData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateSector: (sectorId: SectorType, data: Partial<SectorMetrics>) => Promise<void>;
}

export interface UseSectorAnalysisReturn {
  stats: PortfolioSectorStats;
  recommendations: OptimizationRecommendation[];
  alerts: SectorAlert[];
  comparison: SectorComparison | null;
  loading: boolean;
  error: string | null;
}

// Configuration par défaut
export const DEFAULT_SECTOR_CONFIG = {
  refreshInterval: 300000, // 5 minutes
  alertThresholds: {
    performance: { warning: -5, critical: -10 },
    risk: { warning: 80, critical: 90 },
    allocation: { warning: 0.4, critical: 0.5 } // Concentration max
  },
  gradingWeights: {
    performance: 0.4,
    risk: 0.3,
    trend: 0.2,
    volatility: 0.1
  }
};

export default {
  SectorType,
  RiskLevel,
  SectorCategory,
  TrendDirection,
  SectorGrade,
  SECTOR_DEFINITIONS,
  SectorUtils,
  DEFAULT_SECTOR_CONFIG
};

