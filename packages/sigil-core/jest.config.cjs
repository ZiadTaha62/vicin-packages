/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  displayName: 'sigil-core',
  rootDir: '.',
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx|js)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
};
