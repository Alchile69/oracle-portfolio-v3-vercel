import { Router } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = Router();
const analyticsService = new AnalyticsService();

// Schéma de validation pour le feedback
const feedbackSchema = z.object({
  type: z.enum(['regime', 'allocation', 'sector', 'general']),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// POST /api/v1/analytics/feedback
router.post('/feedback', validateRequest(feedbackSchema), async (req, res, next) => {
  try {
    const feedback = await analyticsService.recordFeedback(req.body);
    res.json({ success: true, feedback });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/analytics/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const { period } = req.query;
    const dashboard = await analyticsService.getDashboardData(period as string || '7D');
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/analytics/usage
router.get('/usage', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const usage = await analyticsService.getUsageStats(
      startDate as string,
      endDate as string
    );
    res.json(usage);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/analytics/performance
router.get('/performance', async (req, res, next) => {
  try {
    const { regime, period } = req.query;
    const performance = await analyticsService.getPerformanceMetrics(
      regime as string,
      period as string || '1Y'
    );
    res.json(performance);
  } catch (error) {
    next(error);
  }
});

export { router as analyticsRoutes }; 