import { Router } from 'express';
import { AllocationService } from '../services/allocationService';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = Router();
const allocationService = new AllocationService();

// Schémas de validation
const getAllocationSchema = z.object({
  regime: z.string(),
  riskProfile: z.string().optional().default('moderate'),
  timeHorizon: z.number().min(1).max(20).optional().default(5)
});

const optimizeAllocationSchema = z.object({
  regime: z.string(),
  constraints: z.object({
    maxRisk: z.number().optional(),
    minReturn: z.number().optional(),
    sectorLimits: z.record(z.number()).optional()
  }).optional(),
  preferences: z.object({
    riskProfile: z.string().optional(),
    timeHorizon: z.number().optional(),
    esgScore: z.number().optional()
  }).optional()
});

// GET /api/v1/allocations/:regime
router.get('/:regime', validateRequest(getAllocationSchema), async (req, res, next) => {
  try {
    const { regime } = req.params;
    const { riskProfile, timeHorizon } = req.query;
    
    const allocation = await allocationService.getAllocation(
      regime,
      riskProfile as string,
      parseInt(timeHorizon as string)
    );
    
    res.json(allocation);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/allocations/optimize
router.post('/optimize', validateRequest(optimizeAllocationSchema), async (req, res, next) => {
  try {
    const { regime, constraints, preferences } = req.body;
    
    const optimizedAllocation = await allocationService.optimizeAllocation(
      regime,
      constraints,
      preferences
    );
    
    res.json(optimizedAllocation);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/allocations/compare
router.get('/compare', async (req, res, next) => {
  try {
    const { regimes } = req.query;
    const regimeList = (regimes as string)?.split(',') || ['EXPANSION', 'RECESSION'];
    
    const comparison = await allocationService.compareAllocations(regimeList);
    res.json(comparison);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/allocations/performance
router.get('/performance', async (req, res, next) => {
  try {
    const { regime, period } = req.query;
    
    const performance = await allocationService.getHistoricalPerformance(
      regime as string,
      period as string || '1Y'
    );
    
    res.json(performance);
  } catch (error) {
    next(error);
  }
});

export { router as allocationRoutes }; 