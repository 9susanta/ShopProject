import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

// Functional interceptor (Angular 20 style)
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Bad request';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            break;
          case 403:
            errorMessage = 'Forbidden. You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = error.error?.message || 'Resource not found';
            break;
          case 409:
            errorMessage = error.error?.message || 'Conflict. The resource already exists.';
            break;
          case 422:
            errorMessage = error.error?.message || 'Validation error';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
          case 503:
            errorMessage = 'Service unavailable. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || `Error: ${error.status} ${error.statusText}`;
        }
      }

      // Suppress console errors for connection refused (backend not running)
      // Status 0 typically means connection refused or network error
      if (error.status === 0) {
        // Only log in development mode with debug level
        if (!environment.production) {
          console.debug('API connection refused (backend may not be running):', req.url);
        }
      } else {
        // Log other errors normally
        console.error('HTTP Error:', {
          url: req.url,
          status: error.status,
          message: errorMessage,
          error: error.error,
        });
      }

      // Return formatted error
      const formattedError = {
        ...error,
        userMessage: errorMessage,
      };

      return throwError(() => formattedError);
    })
  );
};
