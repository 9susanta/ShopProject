describe('Product Management Tests', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type('admin@test.com');
    cy.get('input[type="password"], input[name="password"]').type('Admin123!');
    cy.get('button[type="submit"], button').contains('Login').click();
    cy.url().should('include', '/admin/dashboard');
  });

  it('TC-PROD-001: Create Product - Should create new product successfully', () => {
    cy.visit('/admin/products');
    cy.contains('New Product', 'button').click();
    
    // Fill product form
    cy.get('input[name="name"], input[formControlName="name"]').type('Test Product E2E');
    cy.get('input[name="sku"], input[formControlName="sku"]').type('TEST-E2E-001');
    
    // Select category if dropdown exists
    cy.get('mat-select[name="categoryId"], select[name="categoryId"]').then(($select) => {
      if ($select.length > 0) {
        cy.wrap($select).click();
        cy.get('mat-option').first().click();
      }
    });

    // Select unit
    cy.get('mat-select[name="unitId"], select[name="unitId"]').then(($select) => {
      if ($select.length > 0) {
        cy.wrap($select).click();
        cy.get('mat-option').first().click();
      }
    });

    cy.get('input[name="mrp"], input[formControlName="mrp"]').type('100');
    cy.get('input[name="salePrice"], input[formControlName="salePrice"]').type('90');
    
    // Select tax slab
    cy.get('mat-select[name="taxSlabId"], select[name="taxSlabId"]').then(($select) => {
      if ($select.length > 0) {
        cy.wrap($select).click();
        cy.get('mat-option').first().click();
      }
    });

    // Save product
    cy.get('button[type="submit"], button').contains('Save').click();
    
    // Verify product created
    cy.url().should('include', '/admin/products');
    cy.contains('Test Product E2E').should('be.visible');
  });

  it('TC-PROD-002: Edit Product - Should update product successfully', () => {
    cy.visit('/admin/products');
    
    // Click on first product
    cy.get('table tbody tr, .product-card, .product-item').first().click();
    
    // Click edit button
    cy.contains('Edit', 'button').click();
    
    // Update sale price
    cy.get('input[name="salePrice"], input[formControlName="salePrice"]').clear().type('95');
    
    // Save changes
    cy.get('button[type="submit"], button').contains('Save').click();
    
    // Verify changes
    cy.contains('95').should('be.visible');
  });

  it('TC-PROD-003: Search Products - Should filter products by search term', () => {
    cy.visit('/admin/products');
    
    // Search for product
    cy.get('input[placeholder*="Search"], input[type="search"]').type('Test');
    cy.wait(500);
    
    // Verify filtered results
    cy.get('table tbody tr, .product-card, .product-item').should('have.length.at.least', 1);
  });

  it('TC-PROD-005: Set Reorder Point - Should update reorder point', () => {
    cy.visit('/admin/inventory/products');
    
    // Click on first product
    cy.get('table tbody tr, .product-card').first().click();
    
    // Click edit reorder point
    cy.contains('Reorder Point', 'button').click();
    
    // Set reorder point
    cy.get('input[name="reorderPoint"], input[formControlName="reorderPoint"]').clear().type('50');
    cy.get('input[name="suggestedQuantity"], input[formControlName="suggestedQuantity"]').clear().type('100');
    
    // Save
    cy.get('button[type="submit"], button').contains('Save').click();
    
    // Verify saved
    cy.contains('50').should('be.visible');
  });
});

