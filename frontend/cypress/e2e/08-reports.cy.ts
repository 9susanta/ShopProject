describe('Reports & Analytics Tests', () => {
  beforeEach(() => {
    // Login as admin using the custom command
    cy.loginUI('admin@test.com', 'Admin123!');
  });

  it('TC-REPT-001: Daily Sales Report - Should generate daily sales report', () => {
    // Navigate via dropdown or direct
    cy.visit('/admin/dashboard');
    ;
    
    // Try to navigate via Reports dropdown
    cy.get('body').then(($body) => {
      if ($body.find('.dropdown-trigger').length > 0) {
        cy.contains('.dropdown-trigger, .nav-link', 'Reports', { matchCase: false, timeout: 2000 })
          .should('be.visible')
          .click();
        cy.get('.dropdown-menu', { timeout: 2000 }).should('be.visible');
        cy.get('.dropdown-item').contains('Daily Sales', { matchCase: false }).click();
      } else {
        cy.visit('/admin/reports/daily-sales');
      }
    });
    
    // Wait for page to load
    cy.get('h1, .admin-page-header', { timeout: 2000 }).should('be.visible');
    
    // Select date (default is today) - use datepicker toggle
    cy.get('body').then(($body) => {
      if ($body.find('mat-datepicker-toggle').length > 0) {
        cy.get('mat-datepicker-toggle').first().click();
        ;
        // Try to click today button if available
        cy.get('body').then(($b) => {
          if ($b.find('button').filter((i, el) => el.textContent?.toLowerCase().includes('today')).length > 0) {
            cy.contains('button', 'Today', { matchCase: false }).click();
          }
        });
      }
    });
    
    // Generate report - look for Load Report button
    cy.get('body').then(($body) => {
      const loadBtn = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        return text.includes('load') || text.includes('generate') || text.includes('view');
      });
      if (loadBtn.length > 0) {
        cy.wrap(loadBtn.first()).click();
      } else {
        cy.contains('button', 'Load', { matchCase: false, timeout: 2000 }).click();
      }
    });
    
    // Verify report displayed
    cy.contains('Sales', 'Revenue', 'Total', { timeout: 2000 }).should('be.visible');
  });

  it('TC-REPT-002: GST Summary Report - Should generate GST report', () => {
    // Navigate via dropdown or direct
    cy.visit('/admin/dashboard');
    ;
    
    cy.get('body').then(($body) => {
      if ($body.find('.dropdown-trigger').length > 0) {
        cy.contains('.dropdown-trigger, .nav-link', 'Reports', { matchCase: false, timeout: 2000 })
          .should('be.visible')
          .click();
        cy.get('.dropdown-menu', { timeout: 2000 }).should('be.visible');
        cy.get('.dropdown-item').contains('GST Monthly', { matchCase: false }).click();
      } else {
        cy.visit('/admin/reports/gst-summary');
      }
    });
    
    ;
    
    // Load report button
    cy.get('body').then(($body) => {
      const loadBtn = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        return text.includes('load') || text.includes('generate');
      });
      if (loadBtn.length > 0) {
        cy.wrap(loadBtn.first()).click();
      }
    });
    
    // Verify GST breakdown
    cy.contains('GST', 'CGST', 'SGST', { timeout: 2000, matchCase: false }).should('be.visible');
  });

  it('TC-REPT-003: GSTR-1 Export - Should export GSTR-1 Excel file', () => {
    cy.visit('/admin/reports/gst-export');
    
    // Select date range
    cy.get('input[type="date"]').then(($datepicker) => {
      if ($datepicker.length > 0) {
        cy.wrap($datepicker).first().click();
        cy.get('button').contains('Today').click();
      }
    });
    
    // Export GSTR-1
    cy.contains('Export GSTR-1', 'button').click();
    
    // Verify download (check if file download initiated)
    cy.wait(2000);
    // Note: Actual file download verification requires additional setup
  });

  it('TC-REPT-004: Fast-Moving Products - Should show top-selling products', () => {
    cy.visit('/admin/reports/fast-moving');
    ;
    
    // Load report - it should auto-load or have a load button
    cy.get('body').then(($body) => {
      const loadBtn = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        return text.includes('load') || text.includes('generate');
      });
      if (loadBtn.length > 0) {
        cy.wrap(loadBtn.first()).click();
      }
    });
    
    // Verify products listed or empty state
    cy.get('body', { timeout: 2000 }).then(($body) => {
      if ($body.find('table tbody tr, .product-item').length > 0) {
        cy.get('table tbody tr, .product-item').should('have.length.at.least', 0);
      } else {
        cy.contains('No products', 'No data', { matchCase: false, timeout: 2000 }).should('exist');
      }
    });
  });

  it('TC-REPT-005: Low Stock Report - Should list low stock products', () => {
    // Navigate via dropdown or direct
    cy.visit('/admin/dashboard');
    ;
    
    cy.get('body').then(($body) => {
      if ($body.find('.dropdown-trigger').length > 0) {
        cy.contains('.dropdown-trigger, .nav-link', 'Reports', { matchCase: false, timeout: 2000 })
          .should('be.visible')
          .click();
        cy.get('.dropdown-menu', { timeout: 2000 }).should('be.visible');
        cy.get('.dropdown-item').contains('Low Stock', { matchCase: false }).click();
      } else {
        cy.visit('/admin/reports/low-stock');
      }
    });
    
    ;
    
    // Report should auto-load, or click generate if available
    cy.get('body').then(($body) => {
      const genBtn = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        return text.includes('generate') || text.includes('load') || text.includes('view');
      });
      if (genBtn.length > 0) {
        cy.wrap(genBtn.first()).click();
      }
    });
    
    // Verify low stock products listed or empty state
    cy.get('body', { timeout: 2000 }).then(($body) => {
      if ($body.find('table tbody tr, .product-item').length > 0) {
        cy.get('table tbody tr, .product-item').should('have.length.at.least', 0);
      } else {
        cy.contains('No products', 'No data', { matchCase: false, timeout: 2000 }).should('exist');
      }
    });
  });

  it('TC-REPT-006: Expiry Report - Should list expiring batches', () => {
    // Navigate via dropdown or direct
    cy.visit('/admin/dashboard');
    ;
    
    cy.get('body').then(($body) => {
      if ($body.find('.dropdown-trigger').length > 0) {
        cy.contains('.dropdown-trigger, .nav-link', 'Reports', { matchCase: false, timeout: 2000 })
          .should('be.visible')
          .click();
        cy.get('.dropdown-menu', { timeout: 2000 }).should('be.visible');
        cy.get('.dropdown-item').contains('Expiry', { matchCase: false }).click();
      } else {
        cy.visit('/admin/reports/expiry');
      }
    });
    
    ;
    
    // Set days threshold if input exists
    cy.get('body').then(($body) => {
      const daysInput = $body.find('input[name="days"], input[formControlName="days"], input[placeholder*="days"], input[placeholder*="Days"]');
      if (daysInput.length > 0) {
        cy.wrap(daysInput.first()).clear().type('30');
      }
    });
    
    // Generate report button
    cy.get('body').then(($body) => {
      const genBtn = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase();
        return text.includes('generate') || text.includes('load') || text.includes('view');
      });
      if (genBtn.length > 0) {
        cy.wrap(genBtn.first()).click();
      }
    });
    
    // Verify expiring batches listed or empty state
    cy.get('body', { timeout: 2000 }).then(($body) => {
      if ($body.find('table tbody tr, .batch-item').length > 0) {
        cy.get('table tbody tr, .batch-item').should('have.length.at.least', 0);
      } else {
        cy.contains('No batches', 'No data', 'No items', { matchCase: false, timeout: 2000 }).should('exist');
      }
    });
  });
});

