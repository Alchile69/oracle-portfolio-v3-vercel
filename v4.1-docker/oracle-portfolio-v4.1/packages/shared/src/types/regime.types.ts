export type RegimeType = 'EXPANSION' | 'RECOVERY' | 'STAGFLATION' | 'RECESSION';

export interface RegimeState {
  regime: RegimeType;
  detectedAt: Date;
  duration: number; // jours
  growthScore: number;
  inflationScore: number;
  confidence: number; // 0-1
  isActive: boolean;
}

export interface RegimeHistory {
  id: string;
  regime: RegimeType;
  startDate: Date;
  endDate: Date;
  duration: number;
  growthScore: number;
  inflationScore: number;
  transition?: {
    fromRegime: RegimeType;
    toRegime: RegimeType;
    trigger: string;
  };
}

export interface RegimeEvent {
  id: string;
  regime: RegimeType;
  date: Date;
  duration: number;
  growthScore: number;
  inflationScore: number;
  isActive: boolean;
  transition?: {
    toRegime: RegimeType;
    reason: string;
  };
}

export interface ConfusionMatrix {
  transitions: Record<RegimeType, Record<RegimeType, number>>;
  stability: number; // 0-1
  averageDuration: number;
  flipFlops: number;
  falsePositiveRate: number;
  unstableTransitions: Array<{
    from: RegimeType;
    to: RegimeType;
    duration: number;
    date: Date;
  }>;
}

export interface FreshnessStatus {
  sector: string;
  lastUpdate: Date;
  ageInHours: number;
  status: 'fresh' | 'warning' | 'critical';
  indicators: Array<{
    name: string;
    lastUpdate: Date;
    ageInHours: number;
  }>;
}

export interface FreshnessReport {
  timestamp: Date;
  sectors: FreshnessStatus[];
  hasIssues: boolean;
  criticalAlerts: Array<{
    sector: string;
    message: string;
    severity: 'warning' | 'critical';
  }>;
} 