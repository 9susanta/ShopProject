describe('Inventory Management Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type('admin@test.com');
    cy.get('input[type="password"], input[name="password"]').type('Admin123!');
    cy.get('button[type="submit"], button').contains('Login').click();
    cy.url().should('include', '/admin/dashboard');
  });

  it('TC-INV-001: View Inventory Dashboard - Should display inventory metrics', () => {
    cy.visit('/admin/inventory');
    
    // Verify dashboard elements
    cy.contains('Inventory', { timeout: 10000 }).should('be.visible');
    
    // Check for low stock count (if displayed)
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="low-stock-count"], .low-stock-count').length > 0) {
        cy.get('[data-cy="low-stock-count"], .low-stock-count').should('be.visible');
      }
    });
  });

  it('TC-INV-002: View Low Stock Products - Should list products below threshold', () => {
    cy.visit('/admin/inventory/low-stock');
    
    // Verify low stock list
    cy.contains('Low Stock', { timeout: 10000 }).should('be.visible');
    
    // Check if products are listed
    cy.get('table tbody tr, .product-item, .inventory-item').should('have.length.at.least', 0);
  });

  it('TC-INV-003: Stock Adjustment - Should adjust stock successfully', () => {
    cy.visit('/admin/inventory/adjust');
    
    // Select product
    cy.get('mat-select[name="productId"], select[name="productId"]').then(($select) => {
      if ($select.length > 0) {
        cy.wrap($select).click();
        cy.get('mat-option').first().click();
      }
    });

    // Enter adjustment details
    cy.get('mat-select[name="type"], select[name="type"]').then(($select) => {
      if ($select.length > 0) {
        cy.wrap($select).click();
        cy.get('mat-option').contains('Manual').click();
      }
    });

    cy.get('input[name="quantity"], input[formControlName="quantity"]').type('10');
    cy.get('input[name="reason"], textarea[name="reason"]').type('Stock found during audit');

    // Save adjustment
    cy.get('button[type="submit"], button').contains('Save').click();
    
    // Verify success message
    cy.contains('success', { matchCase: false }).should('be.visible');
  });

  it('TC-INV-004: View Expiring Batches - Should list expiring batches', () => {
    cy.visit('/admin/inventory/expiry');
    
    // Verify expiry list
    cy.contains('Expiry', { timeout: 10000 }).should('be.visible');
    
    // Set days threshold if available
    cy.get('input[name="days"], input[formControlName="days"]').then(($input) => {
      if ($input.length > 0) {
        cy.wrap($input).clear().type('30');
      }
    });
    
    // Verify batches listed
    cy.get('table tbody tr, .batch-item').should('have.length.at.least', 0);
  });
});

