/// <reference types="cypress" />

// Custom commands for Inventory & Purchasing tests

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login with credentials
       */
      login(username: string, password: string): Chainable<void>;

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
    }
  }
}

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { username, password },
  }).then((response) => {
    window.localStorage.setItem('auth_token', response.body.token);
  });
});

Cypress.Commands.add('createPurchaseOrder', (poData: any) => {
  cy.request({
    method: 'POST',
    url: '/api/purchasing/purchase-orders',
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('auth_token')}`,
    },
    body: poData,
  });
});

Cypress.Commands.add('createGRN', (grnData: any) => {
  cy.request({
    method: 'POST',
    url: '/api/purchasing/grn',
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('auth_token')}`,
    },
    body: grnData,
  });
});

Cypress.Commands.add('confirmGRN', (grnId: string) => {
  cy.request({
    method: 'POST',
    url: `/api/purchasing/grn/${grnId}/confirm`,
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('auth_token')}`,
    },
  });
});

export {};

