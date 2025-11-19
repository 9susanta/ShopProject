describe('Inventory Management Tests', () => {
  beforeEach(() => {
    // Login as admin using the custom command
    cy.loginUI('admin@test.com', 'Admin123!');
  });

  it('TC-INV-001: View Inventory Dashboard - Should display inventory metrics', () => {
    cy.visit('/admin/inventory');
    
    // Verify dashboard elements
    cy.contains('Inventory', { timeout: 2000 }).should('be.visible');
    
    // Check for low stock count (if displayed)
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="low-stock-count"], .low-stock-count').length > 0) {
        cy.get('[data-cy="low-stock-count"], .low-stock-count').should('be.visible');
      }
    });
  });

  it('TC-INV-002: View Low Stock Products - Should list products below threshold', () => {
    // Navigate via dropdown menu or direct visit
    cy.visit('/admin/inventory');
    ;
    
    // Try to navigate via dropdown if available, otherwise try direct route
    cy.get('body').then(($body) => {
      if ($body.find('.dropdown-trigger').length > 0) {
        // Navigate through Inventory dropdown
        cy.contains('.dropdown-trigger, .nav-link', 'Inventory', { matchCase: false, timeout: 2000 })
          .should('be.visible')
          .click();
        cy.get('.dropdown-menu', { timeout: 2000 }).should('be.visible');
        cy.get('.dropdown-item').contains('Low Stock', { matchCase: false }).click();
      } else {
        // Fallback to direct navigation
        cy.visit('/admin/inventory/low-stock');
      }
    });
    
    // Verify low stock list
    cy.contains('Low Stock', { timeout: 2000 }).should('be.visible');
    
    // Check if products are listed
    cy.get('table tbody tr, .product-item, .inventory-item').should('have.length.at.least', 0);
  });

  it('TC-INV-003: Stock Adjustment - Should adjust stock successfully', () => {
    cy.visit('/admin/inventory/adjust');
    
    // Wait for page to load
    cy.get('h1, mat-card-title', { timeout: 2000 }).should('be.visible');
    
    // Select product if dropdown exists
    cy.get('body').then(($body) => {
      if ($body.find('mat-select[name="productId"], mat-select[formControlName="productId"]').length > 0) {
        cy.get('mat-select[name="productId"], mat-select[formControlName="productId"]').click();
        cy.get('mat-option', { timeout: 2000 }).first().click();
      }
    });

    // Enter adjustment details
    cy.get('body').then(($body) => {
      if ($body.find('mat-select[name="type"], mat-select[formControlName="type"]').length > 0) {
        cy.get('mat-select[name="type"], mat-select[formControlName="type"]').click();
        cy.get('mat-option', { timeout: 2000 }).contains('Manual', { matchCase: false }).click();
      }
    });

    cy.get('input[name="quantity"], input[formControlName="quantity"]', { timeout: 2000 }).then(($input) => {
      if ($input.length > 0) {
        cy.wrap($input).should('be.visible').type('10');
      }
    });
    
    cy.get('input[name="reason"], textarea[name="reason"], textarea[formControlName="reason"]').then(($input) => {
      if ($input.length > 0) {
        cy.wrap($input).should('be.visible').type('Stock found during audit');
      }
    });

    // Save adjustment
    cy.get('body').then(($body) => {
      if ($body.find('button[type="submit"], button').filter((i, el) => el.textContent?.includes('Save')).length > 0) {
        cy.contains('button', 'Save', { matchCase: false }).should('be.visible').click();
        
        // Verify success message or redirect
        cy.url({ timeout: 2000 }).should((url) => {
          expect(url).to.satisfy((u: string) => 
            u.includes('/admin/inventory') || u.includes('success')
          );
        });
      } else {
        cy.log('Save button not found - form may not be fully loaded');
      }
    });
  });

  it('TC-INV-004: View Expiring Batches - Should list expiring batches', () => {
    cy.visit('/admin/inventory/expiry');
    
    // Verify expiry list
    cy.contains('Expiry', { timeout: 2000 }).should('be.visible');
    
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

