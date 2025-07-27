import { Router } from 'express';
import { RegimeService } from '../services/regimeService';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = Router();
const regimeService = new RegimeService();

// Schémas de validation
const getCurrentRegimeSchema = z.object({
  country: z.string().optional().default('US'),
  includeHistory: z.boolean().optional().default(false)
});

const getRegimeHistorySchema = z.object({
  country: z.string().optional().default('US'),
  days: z.number().min(1).max(365).optional().default(30),
  regime: z.string().optional()
});

// GET /api/v1/regimes/current
router.get('/current', validateRequest(getCurrentRegimeSchema), async (req, res, next) => {
  try {
    const { country, includeHistory } = req.query;
    const regime = await regimeService.getCurrentRegime(country as string, includeHistory === 'true');
    res.json(regime);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/regimes/history
router.get('/history', validateRequest(getRegimeHistorySchema), async (req, res, next) => {
  try {
    const { country, days, regime } = req.query;
    const history = await regimeService.getRegimeHistory(
      country as string,
      parseInt(days as string),
      regime as string
    );
    res.json(history);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/regimes/analysis
router.get('/analysis', async (req, res, next) => {
  try {
    const { country } = req.query;
    const analysis = await regimeService.getRegimeAnalysis(country as string || 'US');
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/regimes/detect
router.post('/detect', async (req, res, next) => {
  try {
    const { country, indicators } = req.body;
    const detection = await regimeService.detectRegime(country, indicators);
    res.json(detection);
  } catch (error) {
    next(error);
  }
});

export { router as regimeRoutes }; 