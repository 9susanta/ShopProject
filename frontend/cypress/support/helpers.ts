/// <reference types="cypress" />

/**
 * Helper functions for E2E tests
 */

/**
 * Wait for page to be fully loaded
 */
export function waitForPageLoad(timeout = 10000) {
  cy.get('body', { timeout }).should('be.visible');
  cy.window().its('document.readyState').should('eq', 'complete');
}

/**
 * Wait for API calls to complete
 */
export function waitForApiCalls(timeout = 5000) {
  cy.wait(timeout);
}

/**
 * Find element with multiple selector options
 */
export function findElement(selectors: string[], options: Partial<Cypress.Timeoutable> = {}) {
  for (const selector of selectors) {
    cy.get('body').then(($body) => {
      if ($body.find(selector).length > 0) {
        return cy.get(selector, options);
      }
    });
  }
  return cy.get(selectors[0], options);
}

/**
 * Click button with flexible text matching
 */
export function clickButton(text: string | string[], options: Partial<Cypress.Timeoutable> = {}) {
  const texts = Array.isArray(text) ? text : [text];
  for (const t of texts) {
    cy.get('body').then(($body) => {
      const buttons = $body.find('button, a, [role="button"]').filter((i, el) => {
        const buttonText = Cypress.$(el).text().toLowerCase();
        return buttonText.includes(t.toLowerCase());
      });
      if (buttons.length > 0) {
        cy.wrap(buttons.first()).click(options);
        return;
      }
    });
  }
  // Fallback: try direct contains
  cy.contains('button, a', texts[0], { matchCase: false, timeout: options.timeout || 5000 }).click();
}

/**
 * Fill form field with multiple selector options
 */
export function fillField(selectors: string[], value: string, options: Partial<Cypress.Timeoutable> = {}) {
  const selector = selectors.join(', ');
  cy.get(selector, { timeout: options.timeout || 5000 })
    .should('be.visible')
    .clear()
    .type(value);
}

/**
 * Select from Material dropdown
 */
export function selectFromDropdown(selectors: string[], optionText?: string, options: Partial<Cypress.Timeoutable> = {}) {
  const selector = selectors.join(', ');
  cy.get('body').then(($body) => {
    if ($body.find(selector).length > 0) {
      cy.get(selector, options).click();
      cy.wait(500); // Wait for dropdown to open
      if (optionText) {
        cy.contains('mat-option, .mat-option', optionText, { matchCase: false, timeout: 3000 }).click();
      } else {
        cy.get('mat-option, .mat-option', { timeout: 3000 }).first().click();
      }
      cy.wait(500); // Wait for selection to apply
    }
  });
}

/**
 * Wait for table/data to load
 */
export function waitForDataLoad(selectors: string[] = ['table tbody tr', '.data-row', 'mat-row'], minRows = 0, timeout = 10000) {
  const selector = selectors.join(', ');
  cy.get(selector, { timeout }).should('have.length.at.least', minRows);
}

/**
 * Handle API errors gracefully
 */
export function handleApiError() {
  cy.on('uncaught:exception', (err) => {
    // Ignore network errors, API errors, etc.
    if (err.message.includes('NetworkError') || 
        err.message.includes('Failed to fetch') ||
        err.message.includes('ERR_CONNECTION_REFUSED') ||
        err.message.includes('Loading chunk') ||
        err.message.includes('ChunkLoadError')) {
      return false;
    }
    return true;
  });
}

