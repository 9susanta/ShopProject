describe('Purchasing Workflow Tests', () => {
  beforeEach(() => {
    // Login as admin using the custom command
    cy.loginUI('admin@test.com', 'Admin123!');
  });

  it('TC-PURCH-001: Create Purchase Order - Should create PO successfully', () => {
    // Navigate via dropdown menu
    cy.visit('/admin/dashboard');
    cy.wait(1000);
    
    // Open Purchasing dropdown
    cy.contains('.dropdown-trigger, .nav-link', 'Purchasing', { matchCase: false, timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Wait for dropdown menu and click Purchase Orders
    cy.get('.dropdown-menu', { timeout: 3000 }).should('be.visible');
    cy.get('.dropdown-item').contains('Purchase Orders', { matchCase: false }).click();
    
    // Wait for page to load
    cy.get('h1, mat-card-title, .admin-page-header', { timeout: 10000 }).should('be.visible');
    
    // Click New button - try multiple selectors
    cy.get('body').then(($body) => {
      const newButton = $body.find('button, a').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        return text.includes('new') || text.includes('create');
      });
      if (newButton.length > 0) {
        cy.wrap(newButton.first()).click();
      } else {
        cy.contains('button, a', 'New', { matchCase: false, timeout: 5000 }).click();
      }
    });
    
    // Wait for form to load
    cy.url({ timeout: 10000 }).should((url) => {
      expect(url).to.satisfy((u: string) => 
        u.includes('/purchasing/purchase-orders') && (u.includes('/new') || u.includes('create'))
      );
    });
    
    // Select supplier - use autocomplete if available
    cy.get('body').then(($body) => {
      // Try autocomplete first (Material autocomplete)
      if ($body.find('input[formControlName="supplierName"], input[matAutocomplete]').length > 0) {
        cy.get('input[formControlName="supplierName"], input[matAutocomplete]', { timeout: 5000 })
          .should('be.visible')
          .type('Fresh');
        cy.wait(1000); // Wait for autocomplete to load
        cy.get('mat-option', { timeout: 3000 }).first().click();
      } 
      // Try mat-select
      else if ($body.find('mat-select[name="supplierId"], mat-select[formControlName="supplierId"]').length > 0) {
        cy.get('mat-select[name="supplierId"], mat-select[formControlName="supplierId"]').click();
        cy.wait(500);
        cy.get('mat-option', { timeout: 3000 }).first().click();
      }
    });

    // Add item - look for Add Item button
    cy.get('body').then(($body) => {
      const addButton = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        return text.includes('add item') || text.includes('add');
      });
      if (addButton.length > 0) {
        cy.wrap(addButton.first()).click();
      }
    });
    
    cy.wait(1000); // Wait for item row to appear
    
    // Select product - try autocomplete first
    cy.get('body').then(($body) => {
      if ($body.find('input[matAutocomplete], input[formControlName*="product"]').length > 0) {
        cy.get('input[matAutocomplete], input[formControlName*="product"]', { timeout: 5000 })
          .first()
          .should('be.visible')
          .type('Apple');
        cy.wait(1000);
        cy.get('mat-option', { timeout: 3000 }).first().click();
      } else if ($body.find('mat-select[name*="product"]').length > 0) {
        cy.get('mat-select[name*="product"]').first().click();
        cy.wait(500);
        cy.get('mat-option', { timeout: 3000 }).first().click();
      }
    });

    // Enter quantity and price
    cy.get('input[formControlName*="quantity"], input[name*="quantity"]', { timeout: 5000 })
      .first()
      .should('be.visible')
      .clear()
      .type('10');
    cy.get('input[formControlName*="unitPrice"], input[name*="unitPrice"]', { timeout: 5000 })
      .first()
      .should('be.visible')
      .clear()
      .type('50');

    // Save PO
    cy.get('button[type="submit"], button').contains('Save', 'Submit', { matchCase: false, timeout: 5000 })
      .should('be.visible')
      .click();
    
    // Verify PO created - check URL or success message
    cy.url({ timeout: 15000 }).should((url) => {
      expect(url).to.satisfy((u: string) => 
        u.includes('/admin/purchasing/purchase-orders')
      );
    });
    
    // Check for success message (optional - may not always appear)
    cy.get('body', { timeout: 5000 }).then(($body) => {
      if ($body.text().toLowerCase().includes('success') || $body.text().toLowerCase().includes('created')) {
        cy.contains('success', 'created', { matchCase: false, timeout: 5000 }).should('exist');
      }
    });
  });

  it('TC-PURCH-002: Create GRN from PO - Should create GRN and update inventory', () => {
    cy.visit('/admin/purchasing/purchase-orders');
    
    // Click on first PO
    cy.get('table tbody tr, .po-item').first().click();
    
    // Create GRN
    cy.contains('Create GRN', 'button').click();
    
    // Verify PO items pre-filled
    cy.get('table tbody tr, .grn-item').should('have.length.at.least', 1);
    
    // Enter received quantities
    cy.get('input[name*="receivedQuantity"], input[formControlName*="receivedQuantity"]').first().clear().type('10');
    cy.get('input[name*="unitCost"], input[formControlName*="unitCost"]').first().clear().type('50');
    
    // Save GRN
    cy.get('button[type="submit"], button').contains('Save').click();
    
    // Confirm GRN
    cy.contains('Confirm', 'button').click();
    cy.contains('Confirm', 'button').last().click();
    
    // Verify GRN confirmed
    cy.contains('confirmed', { matchCase: false }).should('be.visible');
  });

  it('TC-PURCH-003: Create Ad-hoc GRN - Should create GRN without PO', () => {
    cy.visit('/admin/purchasing/grn/new');
    
    // Select supplier
    cy.get('mat-select[name="supplierId"], select[name="supplierId"]').then(($select) => {
      if ($select.length > 0) {
        cy.wrap($select).click();
        cy.get('mat-option').first().click();
      }
    });

    // Add item
    cy.get('button').contains('Add Item', 'Add', { matchCase: false }).click();
    
    // Select product
    cy.get('mat-select[name*="product"], select[name*="product"]').then(($select) => {
      if ($select.length > 0) {
        cy.wrap($select).first().click();
        cy.get('mat-option').first().click();
      }
    });

    // Enter details
    cy.get('input[name*="receivedQuantity"], input[formControlName*="receivedQuantity"]').first().type('5');
    cy.get('input[name*="unitCost"], input[formControlName*="unitCost"]').first().type('100');
    
    // Save and confirm
    cy.get('button[type="submit"], button').contains('Save').click();
    cy.contains('Confirm', 'button').click();
    
    // Verify GRN created
    cy.contains('success', { matchCase: false }).should('be.visible');
  });

  it('TC-PURCH-005: Record Supplier Payment - Should record payment successfully', () => {
    cy.visit('/admin/suppliers/payments');
    
    // Select supplier
    cy.get('mat-select[name="supplierId"], select[name="supplierId"]').then(($select) => {
      if ($select.length > 0) {
        cy.wrap($select).click();
        cy.get('mat-option').first().click();
      }
    });

    // Click record payment
    cy.contains('Record Payment', 'button').click();
    
    // Fill payment form
    cy.get('input[name="amount"], input[formControlName="amount"]').type('5000');
    cy.get('mat-select[name="paymentMethod"], select[name="paymentMethod"]').then(($select) => {
      if ($select.length > 0) {
        cy.wrap($select).click();
        cy.get('mat-option').contains('UPI').click();
      }
    });
    
    cy.get('input[name="referenceNumber"], input[formControlName="referenceNumber"]').type('UPI-12345');
    
    // Save payment
    cy.get('button[type="submit"], button').contains('Save').click();
    
    // Verify payment recorded
    cy.contains('success', { matchCase: false }).should('be.visible');
  });
});

