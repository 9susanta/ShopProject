import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Functional guard (Angular 20 style)
export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if we have stored tokens/user (even if access token might be expired)
  const hasStoredUser = !!authService.getCurrentUser();
  const hasRefreshToken = !!authService.getRefreshToken();
  const isAuthenticated = authService.isAuthenticated();

  // If authenticated, allow access
  if (isAuthenticated) {
    return true;
  }

  // If we have a user and refresh token but access token is missing/expired, try to refresh
  if (hasStoredUser && hasRefreshToken && !isAuthenticated) {
    // Try to refresh token synchronously (this is a limitation of functional guards)
    // In a real app, you might want to use a resolver or make the guard async
    // For now, we'll allow access and let the interceptor handle token refresh
    console.log('AuthGuard: Has stored user and refresh token, allowing access (token will be refreshed by interceptor)');
    return true;
  }

  // No stored credentials, redirect to login
  console.log('AuthGuard: No authentication found, redirecting to login');
  const loginUrl = state.url ? `/login?returnUrl=${encodeURIComponent(state.url)}` : '/login';
  router.navigateByUrl(loginUrl).catch((error) => {
    console.warn('Navigation error in AuthGuard:', error);
  });
  return false;
};

// Admin guard (can be extended)
export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  const hasRefreshToken = !!authService.getRefreshToken();
  
  // Debug logging
  console.log('AdminGuard check:', {
    isAuthenticated,
    user,
    role: user?.role,
    hasAdminRole: authService.hasRole('Admin'),
    hasSuperAdminRole: authService.hasRole('SuperAdmin'),
    isAdmin: authService.isAdmin(),
    isSuperAdmin: authService.isSuperAdmin(),
    hasRefreshToken
  });

  // Check if user has Admin or SuperAdmin role
  const hasAdminAccess = authService.hasRole('Admin') || 
                         authService.hasRole('SuperAdmin') || 
                         authService.isAdmin() ||
                         authService.isSuperAdmin();

  // Allow if authenticated and has Admin/SuperAdmin role
  if (isAuthenticated && hasAdminAccess) {
    return true;
  }

  // If we have a user with Admin/SuperAdmin role and refresh token, allow access (token will be refreshed by interceptor)
  if (user && hasRefreshToken && hasAdminAccess) {
    console.log('AdminGuard: Has stored admin/superadmin user and refresh token, allowing access (token will be refreshed by interceptor)');
    return true;
  }

  console.warn('AdminGuard: Access denied, redirecting to login');
  const loginUrl = state.url ? `/login?returnUrl=${encodeURIComponent(state.url)}` : '/login';
  router.navigateByUrl(loginUrl).catch((error) => {
    console.warn('Navigation error in AdminGuard:', error);
  });
  return false;
};
