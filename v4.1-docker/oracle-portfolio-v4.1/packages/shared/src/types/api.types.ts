import { RegimeType, RegimeState, RegimeHistory, RegimeEvent, ConfusionMatrix } from './regime.types';
import { SectorType, SectorAllocation, AllocationSet, SectorIndicator } from './sector.types';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Regime API
export interface GetCurrentRegimeResponse extends ApiResponse<RegimeState> {}
export interface GetRegimeHistoryResponse extends ApiResponse<RegimeHistory[]> {}
export interface GetRegimeEventsResponse extends ApiResponse<RegimeEvent[]> {}
export interface GetConfusionMatrixResponse extends ApiResponse<ConfusionMatrix> {}

// Allocation API
export interface GetAllocationsResponse extends ApiResponse<SectorAllocation[]> {}
export interface GetAllocationHistoryResponse extends ApiResponse<AllocationSet[]> {}
export interface GetSectorPerformanceResponse extends ApiResponse<Record<SectorType, number>> {}

// Data API
export interface GetSectorDataResponse extends ApiResponse<SectorIndicator[]> {}
export interface GetDataFreshnessResponse extends ApiResponse<{
  sectors: Array<{
    sector: SectorType;
    lastUpdate: Date;
    ageInHours: number;
    status: 'fresh' | 'warning' | 'critical';
  }>;
  hasIssues: boolean;
}> {}

// Export API
export interface ExportDataRequest {
  format: 'csv' | 'json';
  period: number; // jours
  includeAllocations: boolean;
  includeRegimes: boolean;
  includeIndicators: boolean;
}

export interface ExportDataResponse extends ApiResponse<string> {}

// Feedback API
export interface FeedbackData {
  type: 'bug' | 'suggestion' | 'question';
  message: string;
  userId?: string;
  sessionId: string;
  userAgent: string;
  page: string;
}

export interface SubmitFeedbackResponse extends ApiResponse<{ id: string }> {}

// Analytics API
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export interface SendAnalyticsRequest {
  events: AnalyticsEvent[];
}

export interface SendAnalyticsResponse extends ApiResponse<void> {}

// Health Check API
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  version: string;
  uptime: number;
  services: {
    database: 'healthy' | 'degraded' | 'unhealthy';
    dataCollection: 'healthy' | 'degraded' | 'unhealthy';
    regimeDetection: 'healthy' | 'degraded' | 'unhealthy';
  };
  metrics: {
    responseTime: number;
    errorRate: number;
    activeUsers: number;
  };
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface ValidationError extends ApiError {
  field: string;
  value: any;
  constraint: string;
} 