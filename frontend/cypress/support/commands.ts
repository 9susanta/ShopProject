/// <reference types="cypress" />

// Custom commands for E2E tests

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Navigate through dropdown menu
       */
      navigateViaDropdown(menuName: string, itemText: string): Chainable<void>;

      /**
       * Login with credentials via UI
       */
      loginUI(email: string, password: string): Chainable<void>;

      /**
       * Login with credentials via API
       */
      loginAPI(email: string, password: string): Chainable<void>;

      /**
       * Create a purchase order via API
       */
      createPurchaseOrder(poData: any): Chainable<any>;

      /**
       * Create a GRN via API
       */
      createGRN(grnData: any): Chainable<any>;

      /**
       * Confirm a GRN via API
       */
      confirmGRN(grnId: string): Chainable<any>;

      /**
       * Wait for element with retry
       */
      waitForElement(selector: string, timeout?: number): Chainable<void>;
    }
  }
}

// Helper command to navigate through dropdown menu
Cypress.Commands.add('navigateViaDropdown', (menuName: string, itemText: string) => {
  // Click the dropdown trigger
  cy.contains('.dropdown-trigger, .nav-link', menuName, { matchCase: false, timeout: 5000 })
    .should('be.visible')
    .click();
  
  // Wait for dropdown menu to be visible
  cy.get('.dropdown-menu', { timeout: 2000 }).should('be.visible');
  
  // Click the menu item
  cy.get('.dropdown-item')
    .contains(itemText, { matchCase: false, timeout: 2000 })
    .should('be.visible')
    .click();
  
  // Reduced wait - just ensure URL changes
  cy.url({ timeout: 5000 }).should('not.include', '/admin/dashboard');
});

Cypress.Commands.add('loginUI', (email: string, password: string) => {
  cy.visit('/login', { timeout: 15000 });
  
  // Wait for login form to be ready
  cy.get('#email', { timeout: 5000 }).should('be.visible').clear().type(email);
  cy.get('#password', { timeout: 5000 }).should('be.visible').clear().type(password);
  
  // Click login button - wait for it to be enabled
  cy.get('button.login-button, button[type="submit"]', { timeout: 3000 })
    .should('be.visible')
    .should('not.be.disabled')
    .contains('Login')
    .click();
  
  // Wait for navigation to dashboard
  cy.url({ timeout: 10000 }).should('include', '/admin/dashboard');
  
  // Wait for dashboard to load - be flexible with heading
  cy.get('body', { timeout: 5000 }).should(($body) => {
    expect($body.find('h1, .admin-page-header, mat-card-title').length).to.be.greaterThan(0);
  });
  // Removed unnecessary wait
});

Cypress.Commands.add('loginAPI', (email: string, password: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5120/api';
  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200 && response.body.token) {
      window.localStorage.setItem('auth_token', response.body.token);
      window.localStorage.setItem('refresh_token', response.body.refreshToken || '');
    }
  });
});

Cypress.Commands.add('createPurchaseOrder', (poData: any) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5120/api';
  const token = window.localStorage.getItem('auth_token');
  cy.request({
    method: 'POST',
    url: `${apiUrl}/purchasing/purchase-orders`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: poData,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('createGRN', (grnData: any) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5120/api';
  const token = window.localStorage.getItem('auth_token');
  cy.request({
    method: 'POST',
    url: `${apiUrl}/purchasing/grn`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: grnData,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('confirmGRN', (grnId: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5120/api';
  const token = window.localStorage.getItem('auth_token');
  cy.request({
    method: 'POST',
    url: `${apiUrl}/purchasing/grn/${grnId}/confirm`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('waitForElement', (selector: string, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible');
});

export {};

