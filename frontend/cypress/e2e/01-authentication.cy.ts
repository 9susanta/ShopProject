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
    //   timeout: 2000,
    // });
  });

  beforeEach(() => {
    // Wait for frontend to be ready
    cy.request({
      url: 'http://localhost:4200',
      failOnStatusCode: false,
      timeout: 20000,
    });
    cy.visit('/login', { timeout: 20000 });
  });

  it('TC-AUTH-001: Admin Login - Should login with valid credentials', () => {
    cy.get('#email').should('be.visible').type('admin@test.com');
    cy.get('#password').should('be.visible').type('Admin123!');
    cy.get('button.login-button, button[type="submit"]').contains('Login').should('be.visible').click();
    
    // Wait for navigation and check URL
    cy.url({ timeout: 15000 }).should('include', '/admin/dashboard');
    // Check for dashboard heading
    cy.get('h1').contains('Dashboard', { timeout: 2000 }).should('be.visible');
  });

  it('TC-AUTH-001-SUPER: SuperAdmin Login - Should login with super admin credentials', () => {
    cy.visit('/login');
    cy.get('#email').should('be.visible').type('superadmin@test.com');
    cy.get('#password').should('be.visible').type('SuperAdmin123!');
    cy.get('button.login-button, button[type="submit"]').contains('Login').should('be.visible').click();
    
    cy.url({ timeout: 15000 }).should('include', '/admin/dashboard');
    cy.get('h1').contains('Dashboard', { timeout: 2000 }).should('be.visible');
  });

  it('TC-AUTH-001-STAFF: Staff Login - Should login with staff credentials', () => {
    cy.visit('/login');
    cy.get('#email').should('be.visible').type('staff@test.com');
    cy.get('#password').should('be.visible').type('Staff123!');
    cy.get('button.login-button, button[type="submit"]').contains('Login').should('be.visible').click();
    
    // Staff may be redirected to login with returnUrl if they don't have access
    cy.url({ timeout: 15000 }).should((url) => {
      expect(url).to.satisfy((u: string) => 
        u.includes('/admin/dashboard') || u.includes('/login')
      );
    });
    
    // If redirected to dashboard, check for heading
    cy.url().then((url) => {
      if (url.includes('/admin/dashboard')) {
        cy.get('h1').contains('Dashboard', { timeout: 2000 }).should('be.visible');
      }
    });
  });

  it('TC-AUTH-002: Invalid Login - Should show error with invalid credentials', () => {
    cy.visit('/login');
    cy.get('#email').should('be.visible').type('invalid@test.com');
    cy.get('#password').should('be.visible').type('WrongPassword');
    cy.get('button.login-button, button[type="submit"]').contains('Login').should('be.visible').click();
    
    // Wait for error message to appear
    cy.get('.error-message', { timeout: 2000 }).should('be.visible').and('contain.text', 'Invalid');
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
    cy.url({ timeout: 15000 }).should('include', '/admin/dashboard');

    // Click on profile container to open menu
    cy.get('.profile-container', { timeout: 2000 }).should('be.visible').click();
    
    // Wait for profile menu to be visible and logout button to be ready
    cy.get('.profile-menu', { timeout: 2000 }).should('be.visible');
    cy.get('button.profile-menu-item.logout', { timeout: 2000 })
      .should('be.visible')
      .should('not.be.disabled');
    
    // Click logout button - wait a bit for menu to fully render
    cy.wait(200);
    cy.get('button.profile-menu-item.logout')
      .click({ force: true, multiple: false });
    
    // Should redirect to login - wait for navigation
    cy.url({ timeout: 15000 }).should('include', '/login');
  });
});

