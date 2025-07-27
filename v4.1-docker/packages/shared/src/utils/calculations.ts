import { SectorType, SectorAllocation } from '../types/sector.types';
import { RegimeType } from '../types/regime.types';

export const calculateTotalAllocation = (allocations: SectorAllocation[]): number => {
  return allocations.reduce((sum, allocation) => sum + allocation.allocation, 0);
};

export const normalizeAllocations = (allocations: SectorAllocation[]): SectorAllocation[] => {
  const total = calculateTotalAllocation(allocations);
  if (total === 0) return allocations;
  
  return allocations.map(allocation => ({
    ...allocation,
    allocation: (allocation.allocation / total) * 100
  }));
};

export const calculateRiskScore = (allocations: SectorAllocation[]): number => {
  // Score de risque basé sur la concentration et la volatilité des secteurs
  const weights = allocations.map(a => a.allocation / 100);
  const concentrationRisk = weights.reduce((sum, weight) => sum + weight * weight, 0);
  
  // Facteurs de risque par secteur (simplifié)
  const sectorRiskFactors: Record<SectorType, number> = {
    technology: 0.8,
    energy: 0.9,
    finance: 0.7,
    consumer: 0.6,
    healthcare: 0.5,
    utilities: 0.4,
    materials: 0.8,
    industrials: 0.7
  };
  
  const weightedRisk = allocations.reduce((sum, allocation) => {
    return sum + (allocation.allocation / 100) * sectorRiskFactors[allocation.sector];
  }, 0);
  
  return Math.min(concentrationRisk * weightedRisk, 1);
};

export const calculateExpectedReturn = (
  allocations: SectorAllocation[], 
  regime: RegimeType
): number => {
  // Retours attendus par régime et secteur (simplifié)
  const regimeReturns: Record<RegimeType, Record<SectorType, number>> = {
    EXPANSION: {
      technology: 0.15,
      energy: 0.08,
      finance: 0.12,
      consumer: 0.10,
      healthcare: 0.08,
      utilities: 0.06,
      materials: 0.12,
      industrials: 0.11
    },
    RECOVERY: {
      technology: 0.12,
      energy: 0.10,
      finance: 0.15,
      consumer: 0.08,
      healthcare: 0.06,
      utilities: 0.05,
      materials: 0.14,
      industrials: 0.13
    },
    STAGFLATION: {
      technology: 0.05,
      energy: 0.12,
      finance: 0.03,
      consumer: 0.02,
      healthcare: 0.08,
      utilities: 0.10,
      materials: 0.06,
      industrials: 0.04
    },
    RECESSION: {
      technology: 0.02,
      energy: 0.05,
      finance: 0.01,
      consumer: 0.03,
      healthcare: 0.06,
      utilities: 0.08,
      materials: 0.02,
      industrials: 0.01
    }
  };
  
  return allocations.reduce((sum, allocation) => {
    const sectorReturn = regimeReturns[regime][allocation.sector];
    return sum + (allocation.allocation / 100) * sectorReturn;
  }, 0);
};

export const calculateSharpeRatio = (
  returns: number[], 
  riskFreeRate: number = 0.02
): number => {
  if (returns.length === 0) return 0;
  
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance);
  
  if (volatility === 0) return 0;
  
  return (avgReturn - riskFreeRate) / volatility;
};

export const calculateMaxDrawdown = (returns: number[]): number => {
  if (returns.length === 0) return 0;
  
  let peak = 1;
  let maxDrawdown = 0;
  let cumulative = 1;
  
  for (const ret of returns) {
    cumulative *= (1 + ret);
    
    if (cumulative > peak) {
      peak = cumulative;
    }
    
    const drawdown = (peak - cumulative) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
};

export const calculateCorrelation = (series1: number[], series2: number[]): number => {
  if (series1.length !== series2.length || series1.length === 0) return 0;
  
  const n = series1.length;
  const mean1 = series1.reduce((sum, x) => sum + x, 0) / n;
  const mean2 = series2.reduce((sum, x) => sum + x, 0) / n;
  
  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;
  
  for (let i = 0; i < n; i++) {
    const diff1 = series1[i] - mean1;
    const diff2 = series2[i] - mean2;
    
    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }
  
  const denominator = Math.sqrt(denominator1 * denominator2);
  return denominator === 0 ? 0 : numerator / denominator;
}; 