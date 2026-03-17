module.exports = {
  testEnvironment: "node",
  clearMocks: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "**/*.js",
    "!node_modules/**",
    "!coverage/**"
  ]
};