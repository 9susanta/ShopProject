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
    // Reduced timeouts for faster execution
    defaultCommandTimeout: 5000,
    requestTimeout: 5000,
    responseTimeout: 5000,
    pageLoadTimeout: 10000,
    // Enable parallel execution
    numTestsKeptInMemory: 0, // Reduce memory usage
    env: {
      apiUrl: 'http://localhost:5120/api',
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    // Faster execution settings
    execTimeout: 60000,
    taskTimeout: 60000,
  },
});

