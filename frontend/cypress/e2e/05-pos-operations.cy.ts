describe('Point of Sale (POS) Tests', () => {
  beforeEach(() => {
    cy.visit('/pos');
  });

  it('TC-POS-001: Complete Sale Flow - Should complete sale successfully', () => {
    // Wait for POS to load
    cy.contains('POS', 'Point of Sale', { timeout: 10000, matchCase: false }).should('be.visible');
    
    // Search for product
    cy.get('input[placeholder*="Search"], input[type="search"]').type('Test');
    cy.wait(1000);
    
    // Click on first product or add to cart
    cy.get('.product-tile, .product-card, button[aria-label*="Add"]').first().click();
    
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
    
    // Click barcode scanner icon
    cy.get('button[aria-label*="barcode"], button[aria-label*="scan"]').click();
    
    // Enter barcode manually (simulating scan)
    cy.get('input[placeholder*="barcode"], input[type="text"]').type('1234567890123{enter}');
    
    // Verify product added to cart
    cy.get('.cart-item, .cart-summary').should('be.visible');
  });

  it('TC-POS-003: Customer Selection - Should select customer and show loyalty points', () => {
    cy.visit('/pos');
    
    // Add product first
    cy.get('.product-tile, .product-card').first().click();
    
    // Click select customer
    cy.contains('Select Customer', 'Customer', 'button').click();
    
    // Search customer
    cy.get('input[placeholder*="phone"], input[placeholder*="search"]').type('9876543210');
    cy.wait(500);
    
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

