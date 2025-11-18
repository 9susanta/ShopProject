describe('Purchasing Workflow Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type('admin@test.com');
    cy.get('input[type="password"], input[name="password"]').type('Admin123!');
    cy.get('button[type="submit"], button').contains('Login').click();
    cy.url().should('include', '/admin/dashboard');
  });

  it('TC-PURCH-001: Create Purchase Order - Should create PO successfully', () => {
    cy.visit('/admin/purchasing/purchase-orders');
    cy.contains('New', 'button').click();
    
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

    // Enter quantity and price
    cy.get('input[name*="quantity"], input[formControlName*="quantity"]').first().type('10');
    cy.get('input[name*="unitPrice"], input[formControlName*="unitPrice"]').first().type('50');

    // Save PO
    cy.get('button[type="submit"], button').contains('Save').click();
    
    // Verify PO created
    cy.url().should('include', '/admin/purchasing/purchase-orders');
    cy.contains('success', { matchCase: false }).should('be.visible');
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

