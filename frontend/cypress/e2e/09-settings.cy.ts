describe('Settings & Configuration Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type('admin@test.com');
    cy.get('input[type="password"], input[name="password"]').type('Admin123!');
    cy.get('button[type="submit"], button').contains('Login').click();
    cy.url().should('include', '/admin/dashboard');
  });

  it('TC-SETT-001: Update Store Settings - Should update store configuration', () => {
    cy.visit('/admin/settings');
    
    // Update store name
    cy.get('input[name="storeName"], input[formControlName="storeName"]').clear().type('Test Store E2E');
    
    // Update GSTIN
    cy.get('input[name="gstin"], input[formControlName="gstin"]').clear().type('29ABCDE1234F1Z5');
    
    // Update loyalty points
    cy.get('input[name="pointsPerHundred"], input[formControlName="pointsPerHundred"]').clear().type('2');
    
    // Save settings
    cy.get('button[type="submit"], button').contains('Save').click();
    
    // Verify settings saved
    cy.contains('success', 'saved', { matchCase: false }).should('be.visible');
  });

  it('TC-SETT-002: Permission Management - Should assign permissions to role', () => {
    cy.visit('/admin/settings/permissions');
    
    // Select role
    cy.get('mat-select[name="role"], select[name="role"]').then(($select) => {
      if ($select.length > 0) {
        cy.wrap($select).click();
        cy.get('mat-option').contains('Staff').click();
      }
    });
    
    // Check/uncheck permissions
    cy.get('input[type="checkbox"]').first().check();
    
    // Save permissions (auto-save or manual)
    cy.get('button').contains('Save').then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
      }
    });
    
    // Verify permissions saved
    cy.wait(1000);
    cy.get('input[type="checkbox"]').first().should('be.checked');
  });
});

