describe('Authentication Tests', () => {
  const baseUrl = Cypress.config('baseUrl') || 'http://localhost:4200';
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5120/api';

  before(() => {
    // Try to reset database before tests, but don't fail if it times out
    // Skip reset for now - tests will use existing data
    // cy.request({
    //   method: 'POST',
    //   url: `${apiUrl}/test/reset-seed`,
    //   failOnStatusCode: false,
    //   timeout: 10000,
    // });
  });

  beforeEach(() => {
    // Wait for frontend to be ready
    cy.request({
      url: 'http://localhost:4200',
      failOnStatusCode: false,
      timeout: 30000,
    });
    cy.visit('/login', { timeout: 30000 });
  });

  it('TC-AUTH-001: Admin Login - Should login with valid credentials', () => {
    cy.get('input[type="email"], input[name="email"]').type('admin@test.com');
    cy.get('input[type="password"], input[name="password"]').type('Admin123!');
    cy.get('button[type="submit"], button').contains('Login').click();
    
    cy.url().should('include', '/admin/dashboard', { timeout: 10000 });
    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
  });

  it('TC-AUTH-001-SUPER: SuperAdmin Login - Should login with super admin credentials', () => {
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type('superadmin@test.com');
    cy.get('input[type="password"], input[name="password"]').type('SuperAdmin123!');
    cy.get('button[type="submit"], button').contains('Login').click();
    
    cy.url().should('include', '/admin/dashboard', { timeout: 10000 });
    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
  });

  it('TC-AUTH-001-STAFF: Staff Login - Should login with staff credentials', () => {
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type('staff@test.com');
    cy.get('input[type="password"], input[name="password"]').type('Staff123!');
    cy.get('button[type="submit"], button').contains('Login').click();
    
    cy.url().should('include', '/admin/dashboard', { timeout: 10000 });
    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
  });

  it('TC-AUTH-002: Invalid Login - Should show error with invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type('invalid@test.com');
    cy.get('input[type="password"], input[name="password"]').type('WrongPassword');
    cy.get('button[type="submit"], button').contains('Login').click();
    
    cy.contains('Invalid', 'error', 'incorrect', { timeout: 5000, matchCase: false }).should('be.visible');
    cy.url().should('include', '/login');
  });

  it('TC-AUTH-003: Role-Based Access - SuperAdmin should access all routes', () => {
    cy.loginUI('superadmin@test.com', 'SuperAdmin123!');
    
    // SuperAdmin should access settings
    cy.visit('/admin/settings');
    cy.url().should('include', '/admin/settings');
    
    // SuperAdmin should access audit
    cy.visit('/admin/audit');
    cy.url().should('include', '/admin/audit');
  });

  it('TC-AUTH-005: Logout - Should logout successfully', () => {
    // Login first
    cy.loginUI('admin@test.com', 'Admin123!');
    cy.url().should('include', '/admin/dashboard');

    // Logout - try multiple selectors
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label*="menu"]').length > 0) {
        cy.get('button[aria-label*="menu"]').click({ force: true });
      } else if ($body.find('button[aria-label*="account"]').length > 0) {
        cy.get('button[aria-label*="account"]').click({ force: true });
      } else if ($body.find('.user-menu').length > 0) {
        cy.get('.user-menu').click({ force: true });
      } else {
        // Try to find any menu button
        cy.get('button').contains('Menu', 'Account', { matchCase: false }).first().click({ force: true });
      }
    });
    
    cy.contains('Logout', { timeout: 5000 }).click({ force: true });
    cy.url().should('include', '/login', { timeout: 5000 });
  });
});

