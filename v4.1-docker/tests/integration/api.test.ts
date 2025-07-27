import request from 'supertest';
import { app } from '../../packages/backend/src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Oracle Portfolio API Integration Tests', () => {
  beforeAll(async () => {
    // Nettoyer la base de données de test
    await prisma.auditLog.deleteMany();
    await prisma.analyticsEvent.deleteMany();
    await prisma.allocationHistory.deleteMany();
    await prisma.sectorData.deleteMany();
    await prisma.regime.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Health Check', () => {
    it('should return 200 for health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('Regime API', () => {
    beforeEach(async () => {
      // Insérer des données de test
      await prisma.regime.create({
        data: {
          country: 'FRA',
          regime: 'EXPANSION',
          growthScore: 2.5,
          inflationScore: 1.8,
          confidence: 0.85,
          isActive: true,
        },
      });
    });

    afterEach(async () => {
      await prisma.regime.deleteMany();
    });

    it('should return current regime', async () => {
      const response = await request(app)
        .get('/api/v1/regimes/current')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('regime');
      expect(response.body.data).toHaveProperty('detectedAt');
      expect(response.body.data).toHaveProperty('isActive', true);
    });

    it('should return regime history', async () => {
      const response = await request(app)
        .get('/api/v1/regimes/history?days=30')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return confusion matrix', async () => {
      const response = await request(app)
        .get('/api/v1/regimes/confusion-matrix')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('stability');
      expect(response.body.data).toHaveProperty('transitions');
      expect(response.body.data).toHaveProperty('flipFlops');
    });
  });

  describe('Allocation API', () => {
    beforeEach(async () => {
      // Insérer des allocations de test
      await prisma.allocationHistory.create({
        data: {
          regime: 'EXPANSION',
          allocations: [
            { sector: 'technology', allocation: 25, weight: 0.25, confidence: 0.8 },
            { sector: 'consumer', allocation: 20, weight: 0.20, confidence: 0.75 },
            { sector: 'industrials', allocation: 15, weight: 0.15, confidence: 0.7 },
          ],
          isActive: true,
        },
      });
    });

    afterEach(async () => {
      await prisma.allocationHistory.deleteMany();
    });

    it('should return allocations for regime', async () => {
      const response = await request(app)
        .get('/api/v1/allocations/EXPANSION')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('sector');
      expect(response.body.data[0]).toHaveProperty('allocation');
    });

    it('should return allocation history', async () => {
      const response = await request(app)
        .get('/api/v1/allocations/history')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Sector API', () => {
    beforeEach(async () => {
      // Insérer des données sectorielles de test
      await prisma.sectorData.createMany({
        data: [
          {
            sector: 'technology',
            indicatorName: 'nasdaq_performance',
            value: 15000.0,
            date: new Date(),
            source: 'yahoo',
            qualityScore: 0.9,
          },
          {
            sector: 'technology',
            indicatorName: 'software_spending',
            value: 500.0,
            date: new Date(),
            source: 'fred',
            qualityScore: 0.85,
          },
        ],
      });
    });

    afterEach(async () => {
      await prisma.sectorData.deleteMany();
    });

    it('should return sector indicators', async () => {
      const response = await request(app)
        .get('/api/v1/sectors/technology/indicators')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('sector', 'technology');
      expect(response.body.data[0]).toHaveProperty('indicatorName');
      expect(response.body.data[0]).toHaveProperty('value');
    });

    it('should return data freshness', async () => {
      const response = await request(app)
        .get('/api/v1/data/freshness')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sectors');
      expect(response.body.data).toHaveProperty('hasIssues');
    });
  });

  describe('Export API', () => {
    it('should export data as CSV', async () => {
      const response = await request(app)
        .get('/api/v1/export?format=csv&period=30')
        .set('Accept', 'text/csv')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.text).toContain('sector,allocation,regime');
    });

    it('should export data as JSON', async () => {
      const response = await request(app)
        .get('/api/v1/export?format=json&period=30')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('regimes');
      expect(response.body).toHaveProperty('allocations');
    });
  });

  describe('Feedback API', () => {
    it('should submit feedback', async () => {
      const feedback = {
        type: 'suggestion',
        message: 'Test feedback message',
        sessionId: 'test-session-123',
        userAgent: 'test-agent',
        page: '/dashboard',
      };

      const response = await request(app)
        .post('/api/v1/feedback')
        .send(feedback)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should validate feedback data', async () => {
      const invalidFeedback = {
        type: 'invalid_type',
        message: '', // Message vide
        sessionId: 'test-session-123',
      };

      const response = await request(app)
        .post('/api/v1/feedback')
        .send(invalidFeedback)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Analytics API', () => {
    it('should track analytics events', async () => {
      const events = [
        {
          name: 'page_view',
          properties: {
            page: '/dashboard',
            userAgent: 'test-agent',
          },
          sessionId: 'test-session-123',
        },
      ];

      const response = await request(app)
        .post('/api/v1/analytics')
        .send({ events })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should validate analytics events', async () => {
      const invalidEvents = [
        {
          name: '', // Nom vide
          sessionId: 'test-session-123',
        },
      ];

      const response = await request(app)
        .post('/api/v1/analytics')
        .send({ events: invalidEvents })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Faire plusieurs requêtes rapides
      const promises = Array.from({ length: 15 }, () =>
        request(app).get('/api/v1/regimes/current')
      );

      const responses = await Promise.all(promises);
      const tooManyRequests = responses.filter(r => r.status === 429);

      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/feedback')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('CORS', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/v1/regimes/current')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });
  });
}); 