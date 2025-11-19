describe('Customer & Supplier Management Tests', () => {
  beforeEach(() => {
    // Login as admin using the custom command
    cy.loginUI('admin@test.com', 'Admin123!');
  });

  it('TC-CUST-001: Create Customer - Should create customer successfully', () => {
    // Navigate via dropdown or direct
    cy.visit('/admin/dashboard');
    ;
    
    // Try to navigate via Master Data dropdown
    cy.get('body').then(($body) => {
      if ($body.find('.dropdown-trigger').length > 0) {
        cy.contains('.dropdown-trigger, .nav-link', 'Master Data', { matchCase: false, timeout: 2000 })
          .should('be.visible')
          .click();
        cy.get('.dropdown-menu', { timeout: 2000 }).should('be.visible');
        cy.get('.dropdown-item').contains('Customers', { matchCase: false }).click();
      } else {
        cy.visit('/admin/customers');
      }
    });
    
    ;
    
    // Click New Customer button
    cy.get('body').then(($body) => {
      const newBtn = $body.find('button, a').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        return text.includes('new') || text.includes('create') || text.includes('add');
      });
      if (newBtn.length > 0) {
        cy.wrap(newBtn.first()).click();
      } else {
        cy.contains('button, a', 'New', { matchCase: false, timeout: 2000 }).click();
      }
    });
    
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
    cy.contains('Overview', 'Purchase History', { timeout: 2000 }).should('be.visible');
    
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
    // Navigate via dropdown or direct
    cy.visit('/admin/dashboard');
    ;
    
    // Try to navigate via Master Data dropdown
    cy.get('body').then(($body) => {
      if ($body.find('.dropdown-trigger').length > 0) {
        cy.contains('.dropdown-trigger, .nav-link', 'Master Data', { matchCase: false, timeout: 2000 })
          .should('be.visible')
          .click();
        cy.get('.dropdown-menu', { timeout: 2000 }).should('be.visible');
        cy.get('.dropdown-item').contains('Suppliers', { matchCase: false }).click();
      } else {
        cy.visit('/admin/suppliers');
      }
    });
    
    ;
    
    // Click New Supplier button
    cy.get('body').then(($body) => {
      const newBtn = $body.find('button, a').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        return text.includes('new') || text.includes('create') || text.includes('add');
      });
      if (newBtn.length > 0) {
        cy.wrap(newBtn.first()).click();
      } else {
        cy.contains('button, a', 'New', { matchCase: false, timeout: 2000 }).click();
      }
    });
    
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

