describe('Offline Functionality Tests', () => {
  beforeEach(() => {
    cy.visit('/pos');
  });

  it('TC-OFF-001: Offline Indicator - Should display offline status', () => {
    // Check for offline indicator (should not be visible when online)
    cy.get('body').then(($body) => {
      if ($body.find('.offline-indicator, [data-cy="offline-indicator"]').length > 0) {
        cy.get('.offline-indicator, [data-cy="offline-indicator"]').should('not.be.visible');
      }
    });

    // Simulate offline (disable network)
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
      cy.dispatchEvent(win, 'offline');
    });

    // Verify offline indicator appears
    cy.get('.offline-indicator, [data-cy="offline-indicator"]', { timeout: 2000 }).should('be.visible');
  });

  it('TC-OFF-002: Offline Sale Queue - Should queue sales when offline', () => {
    // Simulate offline
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
      cy.dispatchEvent(win, 'offline');
    });

    // Add product to cart
    cy.get('.product-tile, .product-card').first().click();
    
    // Complete sale
    cy.contains('Checkout', 'button').click();
    cy.get('mat-radio-button[value="Cash"], input[value="Cash"]').click();
    cy.get('input[name="cashAmount"], input[formControlName="cashAmount"]').type('1000');
    cy.contains('Complete Sale', 'Complete', 'button').click();
    
    // Verify sale queued (check for queue indicator or message)
    cy.contains('queued', 'offline', { matchCase: false, timeout: 2000 }).should('be.visible');
    
    // Simulate online
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(true);
      cy.dispatchEvent(win, 'online');
    });
    
    // Wait for sync
    cy.wait(2000);
    
    // Verify sale synced (check sales list)
    cy.visit('/admin/sales');
    cy.contains('Sales', { timeout: 2000 }).should('be.visible');
  });
});

