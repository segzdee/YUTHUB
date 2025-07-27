import { afterAll, afterEach, beforeAll, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import { pool } from '../db';

// Global test setup
beforeAll(async () => {
  // Initialize test database connection
  console.log('Setting up test environment...');
});

afterAll(async () => {
  // Clean up database connections
  await pool.end();
  console.log('Test environment cleaned up.');
});

beforeEach(() => {
  // Reset any mocks or test state before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
});

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.CLIENT_URL = 'http://localhost:3000';

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error,
};
