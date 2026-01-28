module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.*\\.(integration-|e2e-)?test\\.ts$',
  modulePaths: ['<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/mocks.ts',
    '!src/setup-app.ts',
    '!src/**/index.ts',
    '!src/**/*.(builder|config|error|interface|mock|module|dto|request-dto).ts',
  ],
}
