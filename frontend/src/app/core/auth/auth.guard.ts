import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  const hasRefreshToken = !!authService.getRefreshToken();

  if (isAuthenticated || hasRefreshToken) {
    return true;
  }

  const loginUrl = state.url ? `/login?returnUrl=${encodeURIComponent(state.url)}` : '/login';
  router.navigateByUrl(loginUrl).catch((error) => {
    console.warn('Navigation error in AuthGuard:', error);
  });
  return false;
};

