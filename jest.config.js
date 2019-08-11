module.exports = {
  coverageDirectory: './coverage',
  collectCoverage: true,
  roots: [
    '<rootDir>/src',
    '<rootDir>/pages',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@dashboard/(.*)$': '<rootDir>/src/$1',
  },
};
