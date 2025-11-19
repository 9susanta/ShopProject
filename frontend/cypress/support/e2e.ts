// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Prevent Cypress from failing on uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  // Ignore network errors, API errors, chunk load errors
  if (
    err.message.includes('NetworkError') ||
    err.message.includes('Failed to fetch') ||
    err.message.includes('ERR_CONNECTION_REFUSED') ||
    err.message.includes('ERR_NETWORK') ||
    err.message.includes('Loading chunk') ||
    err.message.includes('ChunkLoadError')
  ) {
    return false;
  }
  return true;
});

// Handle window resize events
Cypress.on('window:before:load', (win) => {
  // Mock ResizeObserver if needed
  if (!win.ResizeObserver) {
    win.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
  }
});

// Increase default timeouts for slow operations
Cypress.config('defaultCommandTimeout', 10000);
Cypress.config('requestTimeout', 10000);
Cypress.config('responseTimeout', 10000);

