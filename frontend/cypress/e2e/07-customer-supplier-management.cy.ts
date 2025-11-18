describe('Customer & Supplier Management Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type('admin@test.com');
    cy.get('input[type="password"], input[name="password"]').type('Admin123!');
    cy.get('button[type="submit"], button').contains('Login').click();
    cy.url().should('include', '/admin/dashboard');
  });

  it('TC-CUST-001: Create Customer - Should create customer successfully', () => {
    cy.visit('/admin/customers');
    cy.contains('New Customer', 'New', 'button').click();
    
    // Fill customer form
    cy.get('input[name="name"], input[formControlName="name"]').type('Test Customer E2E');
    cy.get('input[name="phone"], input[formControlName="phone"]').type('9876543210');
    cy.get('input[name="email"], input[formControlName="email"]').type('testcustomer@example.com');
    
    // Save customer
    cy.get('button[type="submit"], button').contains('Save').click();
    
    // Verify customer created
    cy.url().should('include', '/admin/customers');
    cy.contains('Test Customer E2E').should('be.visible');
  });

  it('TC-CUST-002: View Customer Details - Should display customer information', () => {
    cy.visit('/admin/customers');
    
    // Click on first customer
    cy.get('table tbody tr, .customer-item').first().click();
    
    // Verify customer details tabs
    cy.contains('Overview', 'Purchase History', { timeout: 10000 }).should('be.visible');
    
    // Check purchase history tab
    cy.contains('Purchase History', 'button').click();
    cy.contains('History', 'Purchases', { matchCase: false }).should('be.visible');
  });

  it('TC-CUST-003: Record Pay-Later Payment - Should record payment', () => {
    cy.visit('/admin/customers');
    
    // Click on first customer
    cy.get('table tbody tr, .customer-item').first().click();
    
    // Go to pay later ledger tab
    cy.contains('Pay Later', 'Ledger', 'button').click();
    
    // Record payment
    cy.contains('Record Payment', 'button').click();
    
    // Fill payment form
    cy.get('input[name="amount"], input[formControlName="amount"]').type('500');
    cy.get('mat-select[name="paymentMethod"], select[name="paymentMethod"]').then(($select) => {
      if ($select.length > 0) {
        cy.wrap($select).click();
        cy.get('mat-option').contains('Cash').click();
      }
    });
    
    cy.get('input[name="referenceNumber"], input[formControlName="referenceNumber"]').type('PAY-001');
    
    // Save payment
    cy.get('button[type="submit"], button').contains('Save').click();
    
    // Verify payment recorded
    cy.contains('success', { matchCase: false }).should('be.visible');
  });

  it('TC-SUPPL-001: Create Supplier - Should create supplier successfully', () => {
    cy.visit('/admin/suppliers');
    cy.contains('New Supplier', 'New', 'button').click();
    
    // Fill supplier form
    cy.get('input[name="name"], input[formControlName="name"]').type('Test Supplier E2E');
    cy.get('input[name="contactPerson"], input[formControlName="contactPerson"]').type('John Doe');
    cy.get('input[name="phone"], input[formControlName="phone"]').type('9876543210');
    cy.get('input[name="gstin"], input[formControlName="gstin"]').type('29ABCDE1234F1Z5');
    
    // Save supplier
    cy.get('button[type="submit"], button').contains('Save').click();
    
    // Verify supplier created
    cy.url().should('include', '/admin/suppliers');
    cy.contains('Test Supplier E2E').should('be.visible');
  });
});

