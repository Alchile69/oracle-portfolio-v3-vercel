// Configuration globale pour les tests
process.env.NODE_ENV = 'test';

// Mock des variables d'environnement
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/oracle_portfolio_test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SESSION_SECRET = 'test-session-secret';

// Configuration des timeouts
jest.setTimeout(10000);

// Mock des APIs externes
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Mock de Winston pour les tests
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
})); 