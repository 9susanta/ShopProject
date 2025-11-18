/// <reference types="cypress" />

// Custom commands for E2E tests

declare global {
  namespace Cypress {
    interface Chainable {
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

Cypress.Commands.add('loginUI', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"], input[name="email"]').type(email);
  cy.get('input[type="password"], input[name="password"]').type(password);
  cy.get('button[type="submit"], button').contains('Login').click();
  cy.url().should('include', '/admin/dashboard');
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

