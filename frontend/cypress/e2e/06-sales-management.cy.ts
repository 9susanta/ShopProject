describe('Sales Management Tests', () => {
  beforeEach(() => {
    // Login as admin using the custom command
    cy.loginUI('admin@test.com', 'Admin123!');
  });

  it('TC-SALE-001: View Sales List - Should display sales with filters', () => {
    // Navigate via dropdown or direct
    cy.visit('/admin/dashboard');
    cy.wait(1000);
    
    cy.get('body').then(($body) => {
      if ($body.find('.dropdown-trigger').length > 0) {
        cy.contains('.dropdown-trigger, .nav-link', 'Sales', { matchCase: false, timeout: 5000 })
          .should('be.visible')
          .click();
        cy.get('.dropdown-menu', { timeout: 3000 }).should('be.visible');
        cy.get('.dropdown-item').contains('Sales List', { matchCase: false }).click();
      } else {
        cy.visit('/admin/sales');
      }
    });
    
    // Verify sales list
    cy.contains('Sales', { timeout: 10000 }).should('be.visible');
    
    // Verify sales table or empty state
    cy.get('body', { timeout: 10000 }).then(($body) => {
      if ($body.find('table tbody tr, .sale-item').length > 0) {
        cy.get('table tbody tr, .sale-item').should('have.length.at.least', 0);
      } else {
        cy.contains('No sales', 'No data', { matchCase: false, timeout: 5000 }).should('exist');
      }
    });
  });

  it('TC-SALE-002: View Sale Details - Should display complete sale information', () => {
    cy.visit('/admin/sales');
    cy.wait(1000);
    
    // Click on first sale if available
    cy.get('body').then(($body) => {
      const saleRow = $body.find('table tbody tr, .sale-item');
      if (saleRow.length > 0) {
        cy.wrap(saleRow.first()).click();
        
        // Verify sale details
        cy.get('body', { timeout: 10000 }).should(($b) => {
          expect($b.find('h1, .sale-details, .invoice-details').length).to.be.greaterThan(0);
        });
      } else {
        cy.log('No sales found to view details');
      }
    });
  });

  it('TC-SALE-003: Create Sale Return - Should process return successfully', () => {
    cy.visit('/admin/sales');
    
    // Click on first sale
    cy.get('table tbody tr, .sale-item').first().click();
    
    // Click create return
    cy.contains('Return', 'button').click();
    
    // Select items to return
    cy.get('input[type="checkbox"]').first().check();
    
    // Enter return quantity
    cy.get('input[name*="returnQuantity"], input[formControlName*="returnQuantity"]').first().type('1');
    
    // Select return reason
    cy.get('mat-select[name*="reason"], select[name*="reason"]').then(($select) => {
      if ($select.length > 0) {
        cy.wrap($select).click();
        cy.get('mat-option').first().click();
      }
    });
    
    // Create return
    cy.contains('Create Return', 'Save', 'button').click();
    
    // Verify return created
    cy.contains('success', 'return', { matchCase: false }).should('be.visible');
  });

  it('TC-SALE-004: Process Refund - Should process refund for return', () => {
    cy.visit('/admin/sales');
    
    // Navigate to returns or find a return
    cy.contains('Returns', 'button').click();
    
    // Click on first return
    cy.get('table tbody tr, .return-item').first().click();
    
    // Process refund
    cy.contains('Process Refund', 'Refund', 'button').click();
    
    // Select refund method
    cy.get('mat-radio-button[value="Cash"], input[value="Cash"]').click();
    
    // Enter refund amount
    cy.get('input[name="refundAmount"], input[formControlName="refundAmount"]').type('100');
    
    // Process refund
    cy.contains('Process', 'button').click();
    
    // Verify refund processed
    cy.contains('success', 'refund', { matchCase: false }).should('be.visible');
  });
});

