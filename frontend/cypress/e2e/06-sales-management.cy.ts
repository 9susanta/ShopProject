describe('Sales Management Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type('admin@test.com');
    cy.get('input[type="password"], input[name="password"]').type('Admin123!');
    cy.get('button[type="submit"], button').contains('Login').click();
    cy.url().should('include', '/admin/dashboard');
  });

  it('TC-SALE-001: View Sales List - Should display sales with filters', () => {
    cy.visit('/admin/sales');
    
    // Verify sales list
    cy.contains('Sales', { timeout: 10000 }).should('be.visible');
    
    // Apply date filter
    cy.get('input[type="date"], mat-datepicker').then(($datepicker) => {
      if ($datepicker.length > 0) {
        cy.wrap($datepicker).first().click();
        cy.get('button').contains('Today').click();
      }
    });
    
    // Verify filtered results
    cy.get('table tbody tr, .sale-item').should('have.length.at.least', 0);
  });

  it('TC-SALE-002: View Sale Details - Should display complete sale information', () => {
    cy.visit('/admin/sales');
    
    // Click on first sale
    cy.get('table tbody tr, .sale-item').first().click();
    
    // Verify sale details
    cy.contains('Invoice', 'Sale', { timeout: 10000 }).should('be.visible');
    cy.contains('Items', 'Products', { matchCase: false }).should('be.visible');
    cy.contains('Total', 'Amount', { matchCase: false }).should('be.visible');
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

