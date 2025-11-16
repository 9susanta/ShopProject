import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LoginRequest } from '@core/models/user.model';
import { firstValueFrom, Subscription } from 'rxjs';

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

  private queryParamsSubscription?: Subscription;
  private timeoutIds: number[] = [];

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe((params) => {
      this.returnUrl.set(params['returnUrl'] || '/admin/dashboard');
    });

    if (this.authService.isAuthenticated()) {
      const timeoutId = window.setTimeout(() => {
        const url = this.returnUrl() || '/admin/dashboard';
        this.router.navigateByUrl(url, { skipLocationChange: false }).catch((error) => {
          if (error?.name !== 'NavigationCancellationError') {
            console.warn('Navigation error in ngOnInit:', error);
          }
        });
      }, 100);
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
      const loginRequest: LoginRequest = { email, password };
      await firstValueFrom(this.authService.login(loginRequest));

      const delayTimeoutId = window.setTimeout(() => {}, 100);
      this.timeoutIds.push(delayTimeoutId);
      await new Promise(resolve => setTimeout(resolve, 100));

      const isAuthenticated = this.authService.isAuthenticated();
      const user = this.authService.getCurrentUser();
      console.log('After login:', { isAuthenticated, user, returnUrl: this.returnUrl() });

      if (isAuthenticated) {
        const targetUrl = this.returnUrl() || '/admin/dashboard';
        console.log('Navigating to:', targetUrl);
        
        const navTimeoutId = window.setTimeout(() => {
          this.router.navigateByUrl(targetUrl, { skipLocationChange: false }).catch((error) => {
            if (error?.name === 'NavigationCancellationError') {
              console.log('Navigation was cancelled');
              return;
            }
            console.error('Navigation error:', error);
            if (targetUrl !== '/admin/dashboard') {
              this.router.navigateByUrl('/admin/dashboard', { skipLocationChange: false }).catch((err) => {
                if (err?.name !== 'NavigationCancellationError') {
                  console.error('Failed to navigate to default dashboard:', err);
                }
              });
            }
          });
        }, 50);
        this.timeoutIds.push(navTimeoutId);
      } else {
        console.error('User not authenticated after login');
        this.error.set('Authentication failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      this.error.set(
        error?.userMessage || error?.message || 'Login failed. Please check your credentials.'
      );
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
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
  }
}

