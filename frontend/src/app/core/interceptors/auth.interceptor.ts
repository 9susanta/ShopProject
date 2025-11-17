import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

// Functional interceptor (Angular 20 style)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip token for auth endpoints (login, refresh, OTP)
  const authEndpoints = ['/auth/login', '/auth/refresh', '/auth/otp', '/auth/otp/verify'];
  const isAuthEndpoint = authEndpoints.some(endpoint => req.url.includes(endpoint));
  
  if (isAuthEndpoint) {
    return next(req);
  }

  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    // User not authenticated, proceed without token
    return next(req);
  }

  // Get current access token
  let token = authService.getAccessToken();
  const refreshToken = authService.getRefreshToken();

  // Check if token is expired or missing
  const isTokenExpired = !token || isTokenExpiredCheck(token);

  // If token is expired or missing, try to refresh it
  if (isTokenExpired && refreshToken) {
    return authService.refreshAccessToken().pipe(
      switchMap((newToken: string) => {
        // Clone request with new token
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        return next(clonedReq);
      }),
      catchError((refreshError) => {
        // If refresh fails, logout and return error
        authService.logout();
        return throwError(() => refreshError);
      })
    );
  }

  // If we have a valid token, add it to the request
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else if (refreshToken) {
    // If no access token but we have refresh token, try to refresh
    return authService.refreshAccessToken().pipe(
      switchMap((newToken: string) => {
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        return next(clonedReq);
      }),
      catchError((refreshError) => {
        authService.logout();
        return throwError(() => refreshError);
      })
    );
  }

  // Proceed with request
  return next(req).pipe(
    catchError((error) => {
      // Handle 401 Unauthorized - token might have expired during request
      if (error.status === 401) {
        const currentRefreshToken = authService.getRefreshToken();
        if (currentRefreshToken) {
          // Try to refresh token and retry request
          return authService.refreshAccessToken().pipe(
            switchMap((newToken: string) => {
              const clonedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next(clonedReq);
            }),
            catchError((err) => {
              // Refresh failed, logout user
              authService.logout();
              return throwError(() => err);
            })
          );
        } else {
          // No refresh token, logout user
          authService.logout();
        }
      }
      
      // Handle 403 Forbidden - might be token issue or insufficient permissions
      if (error.status === 403) {
        // Check if we have a refresh token and try refreshing
        const currentRefreshToken = authService.getRefreshToken();
        if (currentRefreshToken) {
          // Try refreshing token once - if it's a permission issue, it will fail again
          return authService.refreshAccessToken().pipe(
            switchMap((newToken: string) => {
              const clonedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next(clonedReq);
            }),
            catchError((err) => {
              // If refresh fails or still 403, return original error
              // Don't logout on 403 as it might be a permission issue, not auth issue
              return throwError(() => error);
            })
          );
        }
      }
      
      return throwError(() => error);
    })
  );
};

/**
 * Check if JWT token is expired
 * Returns true if token is expired or will expire in less than 1 minute
 */
function isTokenExpiredCheck(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (!exp) return true;
    
    // Check if token expires in less than 1 minute (refresh early)
    const expirationTime = exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    return (expirationTime - now) < oneMinute;
  } catch (error) {
    // If we can't parse the token, consider it expired
    return true;
  }
}
