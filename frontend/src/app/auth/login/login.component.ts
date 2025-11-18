import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/user.model';
import { firstValueFrom, Subscription, catchError, throwError } from 'rxjs';

@Component({
  selector: 'grocery-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = signal('');
  password = signal('');
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  returnUrl = signal<string>('/admin/dashboard');

  // Subscription for cleanup
  private queryParamsSubscription?: Subscription;
  // Timeout IDs for cleanup
  private timeoutIds: number[] = [];

  ngOnInit(): void {
    // Get return URL from route parameters or default to admin dashboard
    this.queryParamsSubscription = this.route.queryParams.subscribe((params) => {
      this.returnUrl.set(params['returnUrl'] || '/admin/dashboard');
    });

    // If already authenticated, redirect (use setTimeout to avoid navigation during initialization)
    if (this.authService.isAuthenticated()) {
      // Use setTimeout to defer navigation until after component initialization
      const timeoutId = window.setTimeout(() => {
        const url = this.returnUrl() || '/admin/dashboard';
        this.router.navigateByUrl(url, { skipLocationChange: false }).catch((error) => {
          // Ignore navigation cancellation errors (router already navigating or guard blocking)
          if (error?.name !== 'NavigationCancellationError') {
            console.warn('Navigation error in ngOnInit:', error);
          }
        });
      }, 100); // Small delay to ensure router is ready
      this.timeoutIds.push(timeoutId);
    }
  }

  async onSubmit(): Promise<void> {
    const email = this.email().trim();
    const password = this.password().trim();

    if (!email || !password) {
      this.error.set('Please enter both email and password');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    try {
      const loginRequest: LoginRequest = {
        email,
        password,
      };

      await firstValueFrom(
        this.authService.login(loginRequest).pipe(
          catchError((error) => {
            // Extract error message from API response
            let errorMsg = 'Login failed. Please check your credentials.';
            if (error?.error?.message) {
              errorMsg = error.error.message;
            } else if (error?.message) {
              errorMsg = error.message;
            }
            this.error.set(errorMsg);
            this.isSubmitting.set(false);
            return throwError(() => error);
          })
        )
      );

      // Small delay to ensure state is fully updated
      const delayTimeoutId = window.setTimeout(() => {}, 100);
      this.timeoutIds.push(delayTimeoutId);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify authentication before redirecting
      const isAuthenticated = this.authService.isAuthenticated();
      const user = this.authService.getCurrentUser();
      console.log('After login:', { isAuthenticated, user, returnUrl: this.returnUrl() });

      if (isAuthenticated) {
        const targetUrl = this.returnUrl() || '/admin/dashboard';
        console.log('Navigating to:', targetUrl);
        
        // Use navigateByUrl for more reliable navigation
        // Single navigation call to avoid multiple transitions
        // Add small delay to ensure router state is stable
        const navTimeoutId = window.setTimeout(() => {
          this.router.navigateByUrl(targetUrl, { skipLocationChange: false }).catch((error) => {
            // Ignore navigation cancellation errors (router already navigating or guard blocking)
            if (error?.name === 'NavigationCancellationError') {
              console.log('Navigation was cancelled (likely already navigating or guard blocking)');
              return;
            }
            
            console.error('Navigation error:', error);
            // If navigation fails and target is not default, try default dashboard once
            if (targetUrl !== '/admin/dashboard') {
              console.log('Falling back to default dashboard');
              this.router.navigateByUrl('/admin/dashboard', { skipLocationChange: false }).catch((err) => {
                if (err?.name !== 'NavigationCancellationError') {
                  console.error('Failed to navigate to default dashboard:', err);
                }
              });
            }
          });
        }, 50); // Small delay to ensure router state is stable
        this.timeoutIds.push(navTimeoutId);
      } else {
        console.error('User not authenticated after login');
        this.error.set('Authentication failed. Please try again.');
      }
    } catch (error: any) {
      // Only log non-connection errors
      if (error?.status !== 0) {
        console.error('Login error:', error);
      }
      
      // Error message should already be set by catchError in the pipe above
      // But fallback if it wasn't set (check multiple error formats)
      if (!this.error()) {
        let errorMsg = 'Login failed. Please check your credentials.';
        
        // Handle connection refused (API not running)
        if (error?.status === 0 || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
          errorMsg = 'Unable to connect to server. Please ensure the API is running on http://localhost:5120';
        } else {
          errorMsg = error?.error?.message || 
                    error?.userMessage || 
                    error?.message || 
                    errorMsg;
        }
        this.error.set(errorMsg);
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onEmailChange(value: string): void {
    this.email.set(value);
    this.error.set(null);
  }

  onPasswordChange(value: string): void {
    this.password.set(value);
    this.error.set(null);
  }

  ngOnDestroy(): void {
    // Unsubscribe from queryParams to prevent memory leaks
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
    // Clear all timeouts to prevent callbacks after component destruction
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
  }
}

