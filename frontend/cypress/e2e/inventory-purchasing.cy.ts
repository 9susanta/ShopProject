/**
 * E2E Test: Purchase Order → GRN → Inventory Update Flow
 * 
 * This test verifies the complete flow:
 * 1. Create a Purchase Order
 * 2. Create a GRN from the PO
 * 3. Confirm the GRN
 * 4. Verify inventory is updated
 */

describe('Inventory & Purchasing Flow', () => {
  beforeEach(() => {
    // Login as admin using the custom command
    cy.loginUI('admin@test.com', 'Admin123!');
  });

  it('should complete PO → GRN → Inventory update flow', () => {
    // Step 1: Navigate to Purchase Orders
    cy.visit('/purchasing/purchase-orders');
    cy.get('h1').should('contain', 'Purchase Orders');

    // Step 2: Create a new Purchase Order
    cy.get('[data-cy=create-po-button]').click();
    cy.url().should('include', '/purchasing/purchase-orders/new');

    // Fill PO form
    cy.get('[data-cy=supplier-select]').click();
    cy.get('mat-option').first().click();

    // Add item
    cy.get('[data-cy=add-item-button]').click();
    
    // Select product (using autocomplete)
    cy.get('[data-cy=product-input]').type('Test Product');
    cy.get('mat-option').first().click();

    // Fill item details
    cy.get('[data-cy=quantity-input]').type('10');
    cy.get('[data-cy=unit-price-input]').type('100');
    cy.get('[data-cy=gst-rate-input]').type('18');

    // Submit PO
    cy.get('[data-cy=submit-po-button]').click();

    // Wait for PO to be created and navigate to details
    cy.url().should('include', '/purchasing/purchase-orders/');
    cy.get('[data-cy=po-number]').should('be.visible');

    // Get PO ID from URL
    cy.url().then((url) => {
      const poId = url.split('/').pop();

      // Step 3: Create GRN from PO
      cy.get('[data-cy=create-grn-button]').click();
      cy.url().should('include', '/purchasing/grn/new');

      // Verify PO items are pre-filled
      cy.get('[data-cy=grn-items]').should('be.visible');

      // Fill GRN details
      cy.get('[data-cy=receive-date]').type('2024-01-15');
      
      // Update received quantities (if different from expected)
      cy.get('[data-cy=received-quantity]').first().clear().type('10');

      // Add batch number and expiry (if applicable)
      cy.get('[data-cy=batch-number]').first().type('BATCH-001');
      cy.get('[data-cy=expiry-date]').first().type('2024-12-31');

      // Submit GRN
      cy.get('[data-cy=submit-grn-button]').click();

      // Wait for GRN to be created
      cy.url().should('include', '/purchasing/grn/');
      cy.get('[data-cy=grn-number]').should('be.visible');

      // Get GRN ID from URL
      cy.url().then((grnUrl) => {
        const grnId = grnUrl.split('/').pop();

        // Step 4: Confirm GRN
        cy.get('[data-cy=confirm-grn-button]').click();
        cy.url().should('include', '/confirm');

        // Review confirmation screen
        cy.get('[data-cy=stock-updates]').should('be.visible');
        cy.get('[data-cy=confirm-button]').click();

        // Wait for confirmation
        cy.get('[data-cy=success-message]').should('contain', 'GRN confirmed successfully');

        // Step 5: Verify inventory is updated
        cy.visit('/inventory/products');
        cy.get('[data-cy=product-list]').should('be.visible');

        // Search for the product
        cy.get('[data-cy=search-input]').type('Test Product');
        cy.get('[data-cy=search-button]').click();

        // Verify stock quantity increased
        cy.get('[data-cy=product-row]').first().within(() => {
          cy.get('[data-cy=total-quantity]').should('contain', '10');
        });

        // Verify batch was created
        cy.get('[data-cy=view-batches-button]').first().click();
        cy.get('[data-cy=batch-list]').should('be.visible');
        cy.get('[data-cy=batch-row]').should('contain', 'BATCH-001');
      });
    });
  });

  it('should show low stock alert when stock falls below threshold', () => {
    // Navigate to inventory dashboard
    cy.visit('/inventory');
    
    // Check for low stock count
    cy.get('[data-cy=low-stock-count]').should('be.visible');

    // Navigate to low stock list
    cy.get('[data-cy=low-stock-card]').click();
    cy.url().should('include', '/inventory/low-stock');

    // Verify low stock products are listed
    cy.get('[data-cy=low-stock-list]').should('be.visible');
  });

  it('should show expiry alerts for expiring batches', () => {
    // Navigate to expiry list
    cy.visit('/inventory/expiry');
    cy.get('h1').should('contain', 'Expiring Soon');

    // Verify expiring batches are listed
    cy.get('[data-cy=expiry-list]').should('be.visible');

    // Test bulk actions
    cy.get('[data-cy=select-all-checkbox]').click();
    cy.get('[data-cy=mark-expired-button]').should('be.visible');
  });
});

