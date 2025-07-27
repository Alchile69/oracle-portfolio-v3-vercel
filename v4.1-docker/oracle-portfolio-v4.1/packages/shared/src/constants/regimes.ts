import { RegimeType } from '../types/regime.types';
import { SectorType } from '../types/sector.types';

export const REGIMES: RegimeType[] = ['EXPANSION', 'RECOVERY', 'STAGFLATION', 'RECESSION'];

export const REGIME_NAMES: Record<RegimeType, string> = {
  EXPANSION: 'Expansion',
  RECOVERY: 'Reprise',
  STAGFLATION: 'Stagflation',
  RECESSION: 'Récession'
};

export const REGIME_COLORS: Record<RegimeType, string> = {
  EXPANSION: '#10B981',   // emerald-500
  RECOVERY: '#3B82F6',    // blue-500
  STAGFLATION: '#F59E0B', // amber-500
  RECESSION: '#EF4444'    // red-500
};

export const REGIME_ICONS: Record<RegimeType, string> = {
  EXPANSION: '📈',
  RECOVERY: '🔄',
  STAGFLATION: '⚠️',
  RECESSION: '📉'
};

export const REGIME_DESCRIPTIONS: Record<RegimeType, string> = {
  EXPANSION: 'Croissance économique forte avec inflation modérée',
  RECOVERY: 'Reprise économique après une période difficile',
  STAGFLATION: 'Stagnation économique avec inflation élevée',
  RECESSION: 'Contraction économique avec faible inflation'
};

export const REGIME_CHARACTERISTICS: Record<RegimeType, {
  growth: 'positive' | 'negative';
  inflation: 'low' | 'high';
  description: string;
  optimalSectors: SectorType[];
}> = {
  EXPANSION: {
    growth: 'positive',
    inflation: 'low',
    description: 'Croissance du PIB > 2%, Inflation < 2.5%',
    optimalSectors: ['technology', 'consumer', 'industrials']
  },
  RECOVERY: {
    growth: 'positive',
    inflation: 'low',
    description: 'Croissance du PIB 1-2%, Inflation < 2%',
    optimalSectors: ['finance', 'materials', 'utilities']
  },
  STAGFLATION: {
    growth: 'negative',
    inflation: 'high',
    description: 'Croissance du PIB < 1%, Inflation > 3%',
    optimalSectors: ['energy', 'utilities', 'healthcare']
  },
  RECESSION: {
    growth: 'negative',
    inflation: 'low',
    description: 'Croissance du PIB < 0%, Inflation < 2%',
    optimalSectors: ['utilities', 'healthcare', 'consumer']
  }
};

export const REGIME_THRESHOLDS: Record<RegimeType, {
  growthMin: number;
  growthMax: number;
  inflationMin: number;
  inflationMax: number;
}> = {
  EXPANSION: {
    growthMin: 2.0,
    growthMax: 5.0,
    inflationMin: 0.5,
    inflationMax: 2.5
  },
  RECOVERY: {
    growthMin: 1.0,
    growthMax: 2.0,
    inflationMin: 0.0,
    inflationMax: 2.0
  },
  STAGFLATION: {
    growthMin: -1.0,
    growthMax: 1.0,
    inflationMin: 3.0,
    inflationMax: 8.0
  },
  RECESSION: {
    growthMin: -5.0,
    growthMax: 0.0,
    inflationMin: 0.0,
    inflationMax: 2.0
  }
};

export const REGIME_TRANSITIONS: Record<RegimeType, RegimeType[]> = {
  EXPANSION: ['RECOVERY', 'STAGFLATION'],
  RECOVERY: ['EXPANSION', 'STAGFLATION', 'RECESSION'],
  STAGFLATION: ['RECOVERY', 'RECESSION'],
  RECESSION: ['RECOVERY', 'STAGFLATION']
};

export const REGIME_DURATION_RANGES: Record<RegimeType, {
  minDays: number;
  maxDays: number;
  averageDays: number;
}> = {
  EXPANSION: { minDays: 90, maxDays: 730, averageDays: 365 },
  RECOVERY: { minDays: 60, maxDays: 365, averageDays: 180 },
  STAGFLATION: { minDays: 30, maxDays: 180, averageDays: 90 },
  RECESSION: { minDays: 60, maxDays: 365, averageDays: 180 }
}; 