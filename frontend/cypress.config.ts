import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false, // Disabled for speed
    screenshotOnRunFailure: true,
    // Optimized timeouts for faster execution
    defaultCommandTimeout: 5000, // Reduced from 10000
    requestTimeout: 5000, // Reduced from 10000
    responseTimeout: 5000, // Reduced from 10000
    pageLoadTimeout: 10000,
    execTimeout: 60000,
    taskTimeout: 60000,
    // Performance optimizations
    numTestsKeptInMemory: 0, // Don't keep tests in memory
    watchForFileChanges: false,
    chromeWebSecurity: false, // Faster, but less secure (OK for E2E)
    env: {
      apiUrl: 'http://localhost:5120/api',
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    // Retry configuration
    retries: {
      runMode: 1, // Retry failed tests once
      openMode: 0,
    },
  },
});

