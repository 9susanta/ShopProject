import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  const hasRefreshToken = !!authService.getRefreshToken();
  
  const hasAdminAccess = authService.hasRole('Admin') || 
                         authService.hasRole('SuperAdmin') || 
                         authService.isAdmin() ||
                         authService.isSuperAdmin();

  if (isAuthenticated && hasAdminAccess) {
    return true;
  }

  if (user && hasRefreshToken && hasAdminAccess) {
    console.log('AdminGuard: Has stored admin/superadmin user and refresh token, allowing access');
    return true;
  }

  console.warn('AdminGuard: Access denied, redirecting to login');
  const loginUrl = state.url ? `/login?returnUrl=${encodeURIComponent(state.url)}` : '/login';
  router.navigateByUrl(loginUrl).catch((error) => {
    console.warn('Navigation error in AdminGuard:', error);
  });
  return false;
};

