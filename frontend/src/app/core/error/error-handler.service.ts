import { Injectable, ErrorHandler, inject } from '@angular/core';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
  private toastService = inject(ToastService);

  handleError(error: Error): void {
    console.error('Global error handler:', error);
    
    // Show user-friendly error message
    this.toastService.error('An unexpected error occurred. Please try again.');
    
    // In production, log to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }
}

