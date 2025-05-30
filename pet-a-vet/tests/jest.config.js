module.exports = {
  testEnvironment: "jsdom",
  roots: [
    "<rootDir>/unit",
    "<rootDir>/integration",
    "<rootDir>/authentication",
    "<rootDir>/signin",
    "<rootDir>/signup",
    "<rootDir>/security",
    "<rootDir>/performance",
    "<rootDir>",
  ],
  testMatch: [
    "**/__tests__/**/*.{js,ts,tsx}",
    "**/?(*.)+(spec|test).{js,ts,tsx}",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/integration/cross-browser-validation.test.ts",
    "<rootDir>/integration/reports-page.test.ts",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
        },
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/../$1",
    "^@/lib/(.*)$": "<rootDir>/../lib/$1",
    "^@/components/(.*)$": "<rootDir>/../components/$1",
  },
  collectCoverageFrom: [
    "../**/*.{js,ts,tsx}",
    "!../node_modules/**",
    "!../.next/**",
    "!../tests/**",
    "!../scripts/**",
  ],
  coverageReporters: ["text", "lcov", "html"],
  preset: "ts-jest",
};
