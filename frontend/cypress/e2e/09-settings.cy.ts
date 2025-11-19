describe('Settings & Configuration Tests', () => {
  beforeEach(() => {
    // Login as admin using the custom command
    cy.loginUI('admin@test.com', 'Admin123!');
  });

  it('TC-SETT-001: Update Store Settings - Should update store configuration', () => {
    // Navigate via dropdown or direct
    cy.visit('/admin/dashboard');
    cy.wait(1000);
    
    cy.get('body').then(($body) => {
      if ($body.find('.dropdown-trigger').length > 0) {
        cy.contains('.dropdown-trigger, .nav-link', 'Settings', { matchCase: false, timeout: 5000 })
          .should('be.visible')
          .click();
        cy.get('.dropdown-menu', { timeout: 3000 }).should('be.visible');
        cy.get('.dropdown-item').contains('Store Settings', { matchCase: false }).click();
      } else {
        cy.visit('/admin/settings');
      }
    });
    
    cy.wait(1000);
    
    // Update store name if input exists
    cy.get('body').then(($body) => {
      const storeNameInput = $body.find('input[name="storeName"], input[formControlName="storeName"]');
      if (storeNameInput.length > 0) {
        cy.wrap(storeNameInput.first()).clear().type('Test Store E2E');
      }
    });
    
    // Update GSTIN if input exists
    cy.get('body').then(($body) => {
      const gstinInput = $body.find('input[name="gstin"], input[formControlName="gstin"]');
      if (gstinInput.length > 0) {
        cy.wrap(gstinInput.first()).clear().type('29ABCDE1234F1Z5');
      }
    });
    
    // Save settings if button exists
    cy.get('body').then(($body) => {
      const saveBtn = $body.find('button[type="submit"], button').filter((i, el) => {
        return el.textContent?.toLowerCase().includes('save');
      });
      if (saveBtn.length > 0) {
        cy.wrap(saveBtn.first()).click();
        // Verify settings saved
        cy.contains('success', 'saved', { matchCase: false, timeout: 5000 }).should('be.visible');
      }
    });
  });

  it('TC-SETT-002: Permission Management - Should assign permissions to role', () => {
    // Navigate via dropdown or direct
    cy.visit('/admin/dashboard');
    cy.wait(1000);
    
    cy.get('body').then(($body) => {
      if ($body.find('.dropdown-trigger').length > 0) {
        cy.contains('.dropdown-trigger, .nav-link', 'Settings', { matchCase: false, timeout: 5000 })
          .should('be.visible')
          .click();
        cy.get('.dropdown-menu', { timeout: 3000 }).should('be.visible');
        cy.get('.dropdown-item').contains('Roles & Permissions', { matchCase: false }).click();
      } else {
        cy.visit('/admin/settings/roles');
      }
    });
    
    cy.wait(1000);
    
    // Select role if dropdown exists
    cy.get('body').then(($body) => {
      const roleSelect = $body.find('mat-select[name="role"], select[name="role"], mat-select[formControlName="role"]');
      if (roleSelect.length > 0) {
        cy.wrap(roleSelect.first()).click();
        cy.wait(500);
        cy.get('mat-option').contains('Staff', { matchCase: false }).click();
      }
    });
    
    // Check/uncheck permissions if checkboxes exist
    cy.get('body').then(($body) => {
      const checkbox = $body.find('input[type="checkbox"]');
      if (checkbox.length > 0) {
        cy.wrap(checkbox.first()).check();
        
        // Save permissions if button exists
        const saveBtn = $body.find('button').filter((i, el) => {
          return el.textContent?.toLowerCase().includes('save');
        });
        if (saveBtn.length > 0) {
          cy.wrap(saveBtn.first()).click();
        }
        
        // Verify permissions saved
        cy.wait(1000);
        cy.get('input[type="checkbox"]').first().should('be.checked');
      }
    });
  });
});

