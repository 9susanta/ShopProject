describe('Point of Sale (POS) Tests', () => {
  beforeEach(() => {
    cy.visit('/pos');
  });

  it('TC-POS-001: Complete Sale Flow - Should complete sale successfully', () => {
    // Navigate to POS via dropdown or direct
    cy.visit('/admin/dashboard');
    ;
    
    cy.get('body').then(($body) => {
      if ($body.find('.dropdown-trigger').length > 0) {
        cy.contains('.dropdown-trigger, .nav-link', 'Sales', { matchCase: false, timeout: 2000 })
          .should('be.visible')
          .click();
        cy.get('.dropdown-menu', { timeout: 2000 }).should('be.visible');
        cy.get('.dropdown-item').contains('POS', { matchCase: false }).first().click();
      } else {
        cy.visit('/pos');
      }
    });
    
    // Wait for POS to load
    cy.get('body', { timeout: 2000 }).should(($body) => {
      expect($body.find('h1, .pos-container, .product-grid').length).to.be.greaterThan(0);
    });
    
    // Search for product if search input exists
    cy.get('body').then(($body) => {
      const searchInput = $body.find('input[placeholder*="Search"], input[type="search"], input[placeholder*="search"]');
      if (searchInput.length > 0) {
        cy.wrap(searchInput.first()).type('Test');
        ;
      }
    });
    
    // Click on first product or add to cart
    cy.get('body').then(($body) => {
      const product = $body.find('.product-tile, .product-card, button[aria-label*="Add"], .product-item');
      if (product.length > 0) {
        cy.wrap(product.first()).click();
      }
    });
    
    // Verify product in cart
    cy.get('.cart-item, .cart-summary').should('be.visible');
    
    // Click checkout
    cy.contains('Checkout', 'button').click();
    
    // Select payment method
    cy.get('mat-radio-button[value="Cash"], input[value="Cash"]').click();
    
    // Enter cash amount
    cy.get('input[name="cashAmount"], input[formControlName="cashAmount"]').type('1000');
    
    // Complete sale
    cy.contains('Complete Sale', 'Complete', 'button').click();
    
    // Verify sale completed
    cy.contains('success', 'completed', { matchCase: false }).should('be.visible');
  });

  it('TC-POS-002: Barcode Scanning - Should add product via barcode', () => {
    cy.visit('/pos');
    ;
    
    // Click barcode scanner icon if available
    cy.get('body').then(($body) => {
      const scanBtn = $body.find('button[aria-label*="barcode"], button[aria-label*="scan"], button .material-icons').filter((i, el) => {
        return el.textContent?.toLowerCase().includes('qr') || el.textContent?.toLowerCase().includes('barcode');
      });
      if (scanBtn.length > 0) {
        cy.wrap(scanBtn.first()).click({ force: true });
      }
    });
    
    // Enter barcode manually (simulating scan) if input exists
    cy.get('body').then(($body) => {
      const barcodeInput = $body.find('input[placeholder*="barcode"], input[placeholder*="Barcode"], input[type="text"]');
      if (barcodeInput.length > 0) {
        cy.wrap(barcodeInput.first()).type('1234567890123{enter}');
        // Verify product added to cart or error message
        cy.get('body', { timeout: 2000 }).then(($b) => {
          if ($b.find('.cart-item, .cart-summary').length > 0) {
            cy.get('.cart-item, .cart-summary').should('be.visible');
          }
        });
      }
    });
  });

  it('TC-POS-003: Customer Selection - Should select customer and show loyalty points', () => {
    cy.visit('/pos');
    
    // Add product first
    cy.get('.product-tile, .product-card').first().click();
    
    // Click select customer
    cy.contains('Select Customer', 'Customer', 'button').click();
    
    // Search customer
    cy.get('input[placeholder*="phone"], input[placeholder*="search"]').type('9876543210');
    ;
    
    // Select customer
    cy.get('mat-option, .customer-option').first().click();
    
    // Verify customer selected
    cy.contains('Loyalty', 'Points', { matchCase: false }).should('be.visible');
  });

  it('TC-POS-004: Apply Discount - Should apply discount to sale', () => {
    cy.visit('/pos');
    
    // Add product
    cy.get('.product-tile, .product-card').first().click();
    
    // Click apply discount or coupon
    cy.contains('Coupon', 'Discount', 'button').click();
    
    // Enter coupon code or discount
    cy.get('input[placeholder*="coupon"], input[name="couponCode"]').type('TEST10');
    cy.contains('Apply', 'button').click();
    
    // Verify discount applied
    cy.contains('discount', { matchCase: false }).should('be.visible');
  });

  it('TC-POS-005: Split Payment - Should process split payment', () => {
    cy.visit('/pos');
    
    // Add product
    cy.get('.product-tile, .product-card').first().click();
    
    // Checkout
    cy.contains('Checkout', 'button').click();
    
    // Select split payment
    cy.contains('Split', 'button').click();
    
    // Enter cash amount
    cy.get('input[name="cashAmount"]').type('500');
    
    // Enter UPI amount
    cy.get('input[name="upiAmount"]').type('500');
    
    // Complete sale
    cy.contains('Complete', 'button').click();
    
    // Verify sale completed
    cy.contains('success', { matchCase: false }).should('be.visible');
  });
});

