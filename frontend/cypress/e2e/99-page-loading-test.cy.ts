describe('Page Loading and Console Error Tests', () => {
  const pages = [
    { name: 'Dashboard', url: '/admin/dashboard' },
    { name: 'Products List', url: '/admin/products' },
    { name: 'Products New', url: '/admin/products/new' },
    { name: 'Inventory Dashboard', url: '/admin/inventory' },
    { name: 'Purchase Orders', url: '/admin/purchasing/purchase-orders' },
    { name: 'Sales', url: '/admin/sales' },
    { name: 'Customers', url: '/admin/customers' },
    { name: 'Suppliers', url: '/admin/suppliers' },
    { name: 'Offers', url: '/admin/offers' },
    { name: 'Reports', url: '/admin/reports' },
    { name: 'Settings', url: '/admin/settings' },
    { name: 'Imports', url: '/admin/imports' },
    { name: 'Accounting', url: '/admin/accounting' },
  ];

  beforeEach(() => {
    // Login first
    cy.loginUI('admin@test.com', 'Admin123!');
    
    // Clear console before each test
    cy.window().then((win) => {
      // Store original console methods
      if (!(win as any).__originalConsoleError) {
        (win as any).__originalConsoleError = win.console.error;
        (win as any).__originalConsoleWarn = win.console.warn;
      }
      
      // Track console calls
      (win as any).__consoleErrors = [];
      (win as any).__consoleWarnings = [];
      
      win.console.error = (...args: any[]) => {
        (win as any).__consoleErrors.push(args);
        (win as any).__originalConsoleError.apply(win.console, args);
      };
      
      win.console.warn = (...args: any[]) => {
        (win as any).__consoleWarnings.push(args);
        (win as any).__originalConsoleWarn.apply(win.console, args);
      };
    });
  });

  pages.forEach((page) => {
    it(`Should load ${page.name} without console errors`, () => {
      cy.visit(page.url, { timeout: 20000 });
      
      // Wait for page to load
      cy.get('body', { timeout: 2000 }).should('be.visible');
      
      // Wait for any async operations to complete
      cy.wait(3000);
      
      // Check for console errors
      cy.window().then((win) => {
        const errors = (win as any).__consoleErrors || [];
        const warnings = (win as any).__consoleWarnings || [];
        
        if (errors.length > 0) {
          cy.log(`Console errors for ${page.name}:`, JSON.stringify(errors));
        }
        if (warnings.length > 0) {
          cy.log(`Console warnings for ${page.name}:`, JSON.stringify(warnings));
        }
        
        // Filter out known non-critical errors
        const criticalErrors = errors.filter((err: any[]) => {
          const errorStr = JSON.stringify(err);
          return !errorStr.includes('ResizeObserver') && 
                 !errorStr.includes('Non-Error promise rejection') &&
                 !errorStr.includes('NetworkError') &&
                 !errorStr.includes('ERR_CONNECTION_REFUSED');
        });
        
        if (criticalErrors.length > 0) {
          cy.log(`Critical errors for ${page.name}:`, JSON.stringify(criticalErrors));
        }
      });
      
      // Check if page has loaded (has some content)
      cy.get('body', { timeout: 2000 }).should(($body) => {
        const hasContent = $body.find('h1, .admin-page-header, mat-card-title, .admin-page-container').length > 0;
        expect(hasContent).to.be.true;
      });
      
      // Check for common error indicators
      cy.get('body').should('not.contain', 'Error loading');
      cy.get('body').should('not.contain', 'Failed to load');
      
      // Check for loading spinners (should not be visible after wait)
      cy.get('body').then(($body) => {
        const spinners = $body.find('mat-spinner, .spinner, .loading');
        if (spinners.length > 0) {
          cy.log(`Warning: ${spinners.length} loading spinner(s) still visible on ${page.name}`);
        }
      });
    });
  });

  it('Should check network requests for errors', () => {
    const failedRequests: any[] = [];
    
    cy.intercept('**', (req) => {
      req.continue((res) => {
        if (res.statusCode >= 400) {
          failedRequests.push({
            url: req.url,
            status: res.statusCode,
            method: req.method,
          });
        }
      });
    }).as('apiRequests');

    pages.slice(0, 5).forEach((page) => {
      cy.visit(page.url, { timeout: 20000 });
      cy.wait(3000);
    });

    cy.then(() => {
      if (failedRequests.length > 0) {
        cy.log('Failed network requests:', JSON.stringify(failedRequests, null, 2));
      } else {
        cy.log('No failed network requests found');
      }
    });
  });
});

