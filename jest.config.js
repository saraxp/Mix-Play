module.exports = {
  // Test environment - jsdom for browser APIs (document, localStorage, etc.)
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'utils.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  moduleNameMapper: {
    '^utils\\.js$': '<rootDir>/utils.js'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/api/',
    '/assests/',
    '/Preview/'
  ],
  clearMocks: true,
  restoreMocks: true
};

