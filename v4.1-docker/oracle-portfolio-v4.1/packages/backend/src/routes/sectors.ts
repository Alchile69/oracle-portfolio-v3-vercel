import { Router } from 'express';
import { SectorService } from '../services/sectorService';

const router = Router();
const sectorService = new SectorService();

// GET /api/v1/sectors
router.get('/', async (req, res, next) => {
  try {
    const sectors = await sectorService.getAllSectors();
    res.json(sectors);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/sectors/:sector
router.get('/:sector', async (req, res, next) => {
  try {
    const { sector } = req.params;
    const sectorData = await sectorService.getSectorData(sector);
    res.json(sectorData);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/sectors/:sector/indicators
router.get('/:sector/indicators', async (req, res, next) => {
  try {
    const { sector } = req.params;
    const { period } = req.query;
    
    const indicators = await sectorService.getSectorIndicators(
      sector, 
      period as string || '1M'
    );
    
    res.json(indicators);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/sectors/:sector/performance
router.get('/:sector/performance', async (req, res, next) => {
  try {
    const { sector } = req.params;
    const { period } = req.query;
    
    const performance = await sectorService.getSectorPerformance(
      sector, 
      period as string || '1Y'
    );
    
    res.json(performance);
  } catch (error) {
    next(error);
  }
});

export { router as sectorRoutes }; 