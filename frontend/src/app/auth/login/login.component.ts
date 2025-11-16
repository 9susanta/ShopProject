import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/user.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'grocery-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = signal('');
  password = signal('');
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  returnUrl = signal<string>('/admin/dashboard');

  ngOnInit(): void {
    // Get return URL from route parameters or default to admin dashboard
    this.route.queryParams.subscribe((params) => {
      this.returnUrl.set(params['returnUrl'] || '/admin/dashboard');
    });

    // If already authenticated, redirect
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl()]);
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

      await firstValueFrom(this.authService.login(loginRequest));

      // Redirect to return URL or admin dashboard
      this.router.navigate([this.returnUrl()]);
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
}

