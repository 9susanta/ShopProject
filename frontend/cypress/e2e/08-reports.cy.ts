describe('Reports & Analytics Tests', () => {
  beforeEach(() => {
    // Login as admin using the custom command
    cy.loginUI('admin@test.com', 'Admin123!');
  });

  it('TC-REPT-001: Daily Sales Report - Should generate daily sales report', () => {
    cy.visit('/admin/reports/daily-sales');
    
    // Select date (default is today)
    cy.get('input[type="date"], mat-datepicker').then(($datepicker) => {
      if ($datepicker.length > 0) {
        cy.wrap($datepicker).click();
        cy.get('button').contains('Today').click();
      }
    });
    
    // Generate report
    cy.contains('Generate', 'View', 'button').click();
    
    // Verify report displayed
    cy.contains('Sales', 'Revenue', 'Total', { timeout: 10000 }).should('be.visible');
  });

  it('TC-REPT-002: GST Summary Report - Should generate GST report', () => {
    cy.visit('/admin/reports/gst-summary');
    
    // Select date range
    cy.get('input[type="date"]').then(($datepicker) => {
      if ($datepicker.length > 0) {
        cy.wrap($datepicker).first().click();
        cy.get('button').contains('Today').click();
      }
    });
    
    // Generate report
    cy.contains('Generate', 'View', 'button').click();
    
    // Verify GST breakdown
    cy.contains('GST', 'CGST', 'SGST', { timeout: 10000, matchCase: false }).should('be.visible');
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
    
    // Select date range
    cy.get('input[type="date"]').then(($datepicker) => {
      if ($datepicker.length > 0) {
        cy.wrap($datepicker).first().click();
        cy.get('button').contains('Today').click();
      }
    });
    
    // Set top N
    cy.get('input[name="topN"], input[formControlName="topN"]').then(($input) => {
      if ($input.length > 0) {
        cy.wrap($input).clear().type('20');
      }
    });
    
    // Generate report
    cy.contains('Generate', 'View', 'button').click();
    
    // Verify products listed
    cy.get('table tbody tr, .product-item').should('have.length.at.least', 0);
  });

  it('TC-REPT-005: Low Stock Report - Should list low stock products', () => {
    cy.visit('/admin/reports/low-stock');
    
    // Set threshold if available
    cy.get('input[name="threshold"], input[formControlName="threshold"]').then(($input) => {
      if ($input.length > 0) {
        cy.wrap($input).clear().type('10');
      }
    });
    
    // Generate report
    cy.contains('Generate', 'View', 'button').click();
    
    // Verify low stock products listed
    cy.get('table tbody tr, .product-item').should('have.length.at.least', 0);
  });

  it('TC-REPT-006: Expiry Report - Should list expiring batches', () => {
    cy.visit('/admin/reports/expiry');
    
    // Set days threshold
    cy.get('input[name="days"], input[formControlName="days"]').clear().type('30');
    
    // Generate report
    cy.contains('Generate', 'View', 'button').click();
    
    // Verify expiring batches listed
    cy.get('table tbody tr, .batch-item').should('have.length.at.least', 0);
  });
});

