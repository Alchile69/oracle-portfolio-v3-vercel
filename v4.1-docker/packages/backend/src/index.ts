import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import { regimeRoutes } from './routes/regimes';
import { allocationRoutes } from './routes/allocations';
import { sectorRoutes } from './routes/sectors';
import { analyticsRoutes } from './routes/analytics';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Middleware de parsing
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '4.1.0'
  });
});

// Routes API
app.use('/api/v1/regimes', regimeRoutes);
app.use('/api/v1/allocations', allocationRoutes);
app.use('/api/v1/sectors', sectorRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
  logger.info('Arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

// Démarrage du serveur
app.listen(PORT, () => {
  logger.info(`🚀 Serveur Oracle Portfolio v4.1 démarré sur le port ${PORT}`);
  logger.info(`📊 Dashboard: http://localhost:${PORT}`);
  logger.info(`🔍 Health check: http://localhost:${PORT}/health`);
});

export { app, prisma }; 