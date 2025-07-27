export interface MarketStress {
  stress_level: 'FAIBLE' | 'MODÉRÉ' | 'ÉLEVÉ' | 'EXTRÊME';
  vix: number;
  high_yield_spread: number;
  data_sources: {
    vix: string;
    spread: string;
  };
  last_update: string;
}

export interface MarketData {
  etfs: {
    [key: string]: number;
  };
  descriptions: {
    [key: string]: string;
  };
  last_update: string;
}

export interface Allocation {
  success: boolean;
  country: string;
  data: {
    regime: string;
    confidence: number;
    allocations: {
      stocks: number;
      bonds: number;
      commodities: number;
      cash: number;
    };
  };
  timestamp: string;
}

export interface ChangeIndicatorProps {
  value: number;
  showArrow?: boolean;
  showPercent?: boolean;
  className?: string;
}

export interface StatusIndicatorProps {
  status: string;
  showDot?: boolean;
  className?: string;
}