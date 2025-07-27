module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx}',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/*.test.{ts,tsx}',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/packages/*/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/packages/*/src/**/*.{test,spec}.{ts,tsx}',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapping: {
    '^@oracle-portfolio/shared$': '<rootDir>/packages/shared/src',
    '^@oracle-portfolio/backend$': '<rootDir>/packages/backend/src',
    '^@oracle-portfolio/frontend$': '<rootDir>/packages/frontend/src',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000,
}; 