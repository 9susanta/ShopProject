import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  User,
  UserRole,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  OtpRequest,
  OtpVerifyRequest,
  OtpVerifyResponse,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private accessToken: string | null = null;
  private refreshToken: string | null = this.getStoredRefreshToken();

  constructor(private api: ApiService) {
    // Load access token from memory (not stored in localStorage for security)
    // In production, consider using secure storage or httpOnly cookies
    this.accessToken = this.getStoredAccessToken();
  }

  /**
   * Login with email and password (Admin/Staff)
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', credentials).pipe(
      tap((response) => {
        this.setTokens(response.accessToken, response.refreshToken);
        this.setUser(response.user);
        this.currentUserSubject.next(response.user);
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Customer quick login via OTP
   */
  requestOtp(phone: string): Observable<void> {
    return this.api.post<{ phone: string }>('/auth/otp', { phone }).pipe(
      map(() => undefined as void),
      catchError((error) => {
        console.error('OTP request failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Verify OTP and login customer
   */
  verifyOtp(phone: string, code: string): Observable<OtpVerifyResponse> {
    return this.api.post<OtpVerifyResponse>('/auth/otp/verify', { phone, code }).pipe(
      tap((response) => {
        this.setTokens(response.accessToken, response.refreshToken);
        this.setUser(response.customer);
        this.currentUserSubject.next(response.customer);
      }),
      catchError((error) => {
        console.error('OTP verification failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Refresh access token
   */
  refreshAccessToken(): Observable<string> {
    if (!this.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.api.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken: this.refreshToken,
    }).pipe(
      tap((response) => {
        this.setTokens(response.accessToken, response.refreshToken || this.refreshToken || '');
      }),
      map((response) => response.accessToken),
      catchError((error) => {
        console.error('Token refresh failed:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.removeStoredTokens();
    this.removeStoredUser();
    this.currentUserSubject.next(null);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.getCurrentUser();
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user has admin role
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.Admin;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    // Store refresh token in localStorage (in production, use secure storage)
    // Access token stored in memory only for better security
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private getStoredAccessToken(): string | null {
    // In production, consider getting from secure storage or httpOnly cookie
    // For now, we'll rely on the interceptor to handle token refresh
    return null;
  }

  private getStoredRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private removeStoredTokens(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    // Access token is in memory, no need to remove
  }

  private removeStoredUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }
}

