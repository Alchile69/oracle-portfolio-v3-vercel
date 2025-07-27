import { RegimeType } from './regime.types';

export type SectorType = 'technology' | 'energy' | 'finance' | 'consumer' | 'healthcare' | 'utilities' | 'materials' | 'industrials';

export interface SectorAllocation {
  sector: SectorType;
  allocation: number; // 0-100
  weight: number; // 0-1
  confidence: number; // 0-1
  rationale: string;
}

export interface AllocationSet {
  id: string;
  regime: RegimeType;
  allocations: SectorAllocation[];
  totalAllocation: number;
  riskScore: number; // 0-1
  expectedReturn: number; // %
  validFrom: Date;
  validTo?: Date;
  isActive: boolean;
}

export interface SectorIndicator {
  sector: SectorType;
  indicatorName: string;
  value: number;
  timestamp: Date;
  source: DataSource;
  quality: DataQuality;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface DataSource {
  name: string;
  priority: number;
  type: 'primary' | 'secondary' | 'fallback';
  isHealthy: boolean;
  lastSuccessfulFetch: Date;
  errorCount: number;
}

export interface DataQuality {
  score: number; // 0-1
  issues: QualityIssue[];
  isFresh: boolean;
  isValidated: boolean;
}

export interface QualityIssue {
  type: 'missing_data' | 'outlier' | 'stale_data' | 'inconsistent';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ValidatedData {
  indicators: SectorIndicator[];
  quality: DataQuality;
}

export interface SectorPerformance {
  sector: SectorType;
  performance: number; // %
  volatility: number; // %
  sharpeRatio: number;
  maxDrawdown: number; // %
  correlation: Record<SectorType, number>;
}

export interface RegimeAllocations {
  EXPANSION: SectorAllocation[];
  RECOVERY: SectorAllocation[];
  STAGFLATION: SectorAllocation[];
  RECESSION: SectorAllocation[];
} 