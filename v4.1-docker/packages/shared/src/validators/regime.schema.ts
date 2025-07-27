import { z } from 'zod';
import { RegimeType } from '../types/regime.types';

export const RegimeTypeSchema = z.enum(['EXPANSION', 'RECOVERY', 'STAGFLATION', 'RECESSION']);

export const RegimeStateSchema = z.object({
  regime: RegimeTypeSchema,
  detectedAt: z.date(),
  duration: z.number().min(0),
  growthScore: z.number().min(-10).max(10),
  inflationScore: z.number().min(0).max(20),
  confidence: z.number().min(0).max(1),
  isActive: z.boolean()
});

export const RegimeHistorySchema = z.object({
  id: z.string().uuid(),
  regime: RegimeTypeSchema,
  startDate: z.date(),
  endDate: z.date(),
  duration: z.number().min(0),
  growthScore: z.number().min(-10).max(10),
  inflationScore: z.number().min(0).max(20),
  transition: z.object({
    fromRegime: RegimeTypeSchema,
    toRegime: RegimeTypeSchema,
    trigger: z.string()
  }).optional()
});

export const RegimeEventSchema = z.object({
  id: z.string().uuid(),
  regime: RegimeTypeSchema,
  date: z.date(),
  duration: z.number().min(0),
  growthScore: z.number().min(-10).max(10),
  inflationScore: z.number().min(0).max(20),
  isActive: z.boolean(),
  transition: z.object({
    toRegime: RegimeTypeSchema,
    reason: z.string()
  }).optional()
});

export const ConfusionMatrixSchema = z.object({
  transitions: z.record(RegimeTypeSchema, z.record(RegimeTypeSchema, z.number())),
  stability: z.number().min(0).max(1),
  averageDuration: z.number().min(0),
  flipFlops: z.number().min(0),
  falsePositiveRate: z.number().min(0).max(1),
  unstableTransitions: z.array(z.object({
    from: RegimeTypeSchema,
    to: RegimeTypeSchema,
    duration: z.number().min(0),
    date: z.date()
  }))
});

export const FreshnessStatusSchema = z.object({
  sector: z.string(),
  lastUpdate: z.date(),
  ageInHours: z.number().min(0),
  status: z.enum(['fresh', 'warning', 'critical']),
  indicators: z.array(z.object({
    name: z.string(),
    lastUpdate: z.date(),
    ageInHours: z.number().min(0)
  }))
});

export const FreshnessReportSchema = z.object({
  timestamp: z.date(),
  sectors: z.array(FreshnessStatusSchema),
  hasIssues: z.boolean(),
  criticalAlerts: z.array(z.object({
    sector: z.string(),
    message: z.string(),
    severity: z.enum(['warning', 'critical'])
  }))
}); 