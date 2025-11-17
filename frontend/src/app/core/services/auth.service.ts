import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, map, shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { environment } from '@environments/environment';
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

  private accessToken: string | null = this.getStoredAccessToken();
  private refreshToken: string | null = this.getStoredRefreshToken();
  private api: ApiService | null = null;
  private refreshTokenInProgress: Observable<string> | null = null;

  constructor(private injector: Injector) {
    // Tokens are loaded from localStorage on service initialization
    // In production, consider using secure storage or httpOnly cookies
    
    // On initialization, restore user state immediately (synchronous)
    // Token refresh will be deferred to avoid circular dependency
    this.initializeAuth();
  }

  /**
   * Get ApiService lazily to avoid circular dependency
   */
  private getApiService(): ApiService {
    if (!this.api) {
      this.api = this.injector.get(ApiService);
    }
    return this.api;
  }

  /**
   * Initialize authentication state on service creation
   * Validates stored tokens and refreshes if needed
   * Token refresh is deferred to avoid circular dependency with interceptor
   */
  private initializeAuth(): void {
    const storedUser = this.getStoredUser();
    const storedAccessToken = this.accessToken || this.getStoredAccessToken();
    const storedRefreshToken = this.refreshToken || this.getStoredRefreshToken();

    // Log initialization status without sensitive data
    if (!environment.production) {
      console.debug('Initializing auth:', {
        hasUser: !!storedUser,
        hasAccessToken: !!storedAccessToken,
        hasRefreshToken: !!storedRefreshToken
      });
    }

    // Update user subject if we have a stored user (synchronous - no HTTP calls)
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
      if (!environment.production) {
        console.debug('User restored from storage');
      }
    }

    // If we have a user and refresh token, we're good
    // Don't refresh token here to avoid circular dependency
    // The interceptor will handle token refresh when the first API call is made
    if (storedUser && storedRefreshToken) {
      // Check if access token is expired (if it exists) - just for logging
      const isTokenExpired = storedAccessToken ? this.isTokenExpired(storedAccessToken) : true;
      
      if (!environment.production) {
        if (!storedAccessToken || isTokenExpired) {
          console.debug('Access token missing or expired. Will be refreshed by interceptor on first API call.');
        } else {
          console.debug('Access token is still valid');
        }
      }
    } else if (storedUser && !storedRefreshToken) {
      // User exists but no refresh token - clear user data
      // Defer logout to avoid circular dependency during initialization
      console.warn('User found but no refresh token, will clear auth state after initialization');
      // Use setTimeout to defer logout until after DI is complete
      setTimeout(() => {
        this.logout();
      }, 0);
    }
  }

  /**
   * Check if JWT token is expired
   * Note: This is a simple check - doesn't verify signature
   */
  private isTokenExpired(token: string): boolean {
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
      console.error('Error checking token expiration:', error);
      return true; // If we can't parse, consider it expired
    }
  }

  /**
   * Login with email and password (Admin/Staff)
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.getApiService().post<LoginResponse>('/auth/login', credentials).pipe(
      tap((response) => {
        console.log('Login response received:', response);
        // Map backend role number to frontend role string
        const mappedRole = this.mapRoleFromBackend(response.user.role as any);
        console.log('Role mapping:', { 
          originalRole: response.user.role, 
          mappedRole,
          roleType: typeof response.user.role 
        });
        
        const user = {
          ...response.user,
          role: mappedRole
        };
        
        if (!environment.production) {
          console.debug('User authenticated successfully');
        }
        this.setTokens(response.accessToken, response.refreshToken);
        this.setUser(user);
        this.currentUserSubject.next(user);
        
        // Verify after setting (without logging sensitive data)
        if (!environment.production) {
          console.debug('Auth state verified:', {
            hasAccessToken: !!this.accessToken,
            hasUser: !!this.getCurrentUser(),
            isAuthenticated: this.isAuthenticated()
          });
        }
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Map backend role number or string to frontend role enum
   * Backend: 0=SuperAdmin, 1=Admin, 2=Staff, 3=Customer (numbers)
   * Backend also sends: "SuperAdmin", "Admin", "Staff", "Customer" (strings from JWT)
   * Frontend: UserRole.SuperAdmin, UserRole.Admin, UserRole.Staff, UserRole.Customer
   */
  private mapRoleFromBackend(role: number | string): UserRole {
    if (typeof role === 'string') {
      // Backend sends role strings like "SuperAdmin", "Admin", etc. (from TokenService.cs)
      // Check if the string matches any enum value directly (case-sensitive)
      const enumValues = Object.values(UserRole) as string[];
      if (enumValues.includes(role)) {
        return role as UserRole;
      }
      
      // If direct match fails, try case-insensitive match
      const roleKeys = Object.keys(UserRole) as Array<keyof typeof UserRole>;
      const matchedKey = roleKeys.find(key => {
        const enumValue = UserRole[key];
        return enumValue === role || 
               (typeof enumValue === 'string' && enumValue.toLowerCase() === role.toLowerCase());
      });
      
      if (matchedKey) {
        return UserRole[matchedKey];
      }
      
      // If no match found, log warning and return default
      console.warn(`Unknown role string received: "${role}", defaulting to Staff`);
      return UserRole.Staff;
    }
    
    // Map numeric role to enum
    const roleMap: { [key: number]: UserRole } = {
      0: UserRole.SuperAdmin,
      1: UserRole.Admin,
      2: UserRole.Staff,
      3: UserRole.Customer
    };
    
    const mappedRole = roleMap[role];
    if (mappedRole) {
      return mappedRole;
    }
    
    // If number doesn't match, log warning and return default
    console.warn(`Unknown role number received: ${role}, defaulting to Staff`);
    return UserRole.Staff;
  }

  /**
   * Customer quick login via OTP
   */
  requestOtp(phone: string): Observable<void> {
    return this.getApiService().post<{ phone: string }>('/auth/otp', { phone }).pipe(
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
    return this.getApiService().post<OtpVerifyResponse>('/auth/otp/verify', { phone, code }).pipe(
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
   * Implements a queue mechanism to prevent concurrent refresh requests
   */
  refreshAccessToken(): Observable<string> {
    if (!this.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    // If a refresh is already in progress, return the existing observable
    if (this.refreshTokenInProgress) {
      return this.refreshTokenInProgress;
    }

    // Create new refresh request
    const refreshRequest = this.getApiService().post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken: this.refreshToken,
    }).pipe(
      tap((response) => {
        this.setTokens(response.accessToken, response.refreshToken || this.refreshToken || '');
        // Clear the in-progress flag on success
        this.refreshTokenInProgress = null;
      }),
      map((response) => response.accessToken),
      catchError((error) => {
        console.error('Token refresh failed:', error);
        // Clear the in-progress flag on error
        this.refreshTokenInProgress = null;
        this.logout();
        return throwError(() => error);
      }),
      // Share the observable so multiple subscribers get the same result
      shareReplay(1)
    );

    // Store the in-progress request
    this.refreshTokenInProgress = refreshRequest;

    return refreshRequest;
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
   * Returns true if we have a user and either:
   * - A valid access token, OR
   * - A refresh token (which can be used to get a new access token)
   */
  isAuthenticated(): boolean {
    const hasUser = !!this.getCurrentUser();
    // Check both property and localStorage for access token (symmetrical with refresh token check)
    const hasAccessToken = !!this.accessToken || !!this.getStoredAccessToken();
    // Check both property and localStorage for refresh token
    const hasRefreshToken = !!this.refreshToken || !!this.getStoredRefreshToken();
    
    // User is authenticated if they have a user and either an access token or refresh token
    // If only refresh token exists, the interceptor will handle token refresh
    const result = hasUser && (hasAccessToken || hasRefreshToken);
    
    if (!environment.production) {
      console.debug('isAuthenticated check:', {
        hasUser,
        hasAccessToken,
        hasRefreshToken,
        result
      });
    }
    
    return result;
  }

  /**
   * Get current user
   * Checks both the subject and localStorage to ensure we have the user on refresh
   */
  getCurrentUser(): User | null {
    const subjectUser = this.currentUserSubject.value;
    if (subjectUser) {
      return subjectUser;
    }
    
    // If subject is null, try to get from storage (e.g., on page refresh)
    const storedUser = this.getStoredUser();
    if (storedUser) {
      // Update the subject so future calls are faster
      this.currentUserSubject.next(storedUser);
      return storedUser;
    }
    
    return null;
  }

  /**
   * Check if user has admin role (Admin or SuperAdmin)
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const role = user.role;
    const roleStr = String(role);
    const roleLower = roleStr.toLowerCase();
    return roleStr === 'Admin' || 
           roleStr === 'SuperAdmin' ||
           role === UserRole.Admin || 
           role === UserRole.SuperAdmin ||
           roleLower === 'admin' ||
           roleLower === 'superadmin';
  }

  /**
   * Check if user is SuperAdmin
   */
  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const role = user.role;
    const roleStr = String(role);
    const roleLower = roleStr.toLowerCase();
    return roleStr === 'SuperAdmin' ||
           role === UserRole.SuperAdmin ||
           roleLower === 'superadmin';
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      if (!environment.production) {
        console.debug('hasRole: No user found');
      }
      return false;
    }
    
    // Normalize roles for comparison
    const userRole = typeof user.role === 'string' ? user.role : String(user.role);
    const requestedRole = role;
    
    // Handle both string and enum comparisons
    const roleMatch = userRole === requestedRole || 
                     userRole === (requestedRole as UserRole) ||
                     userRole.toLowerCase() === requestedRole.toLowerCase();
    
    if (!environment.production) {
      console.debug('hasRole check:', { 
        requestedRole, 
        hasRole: !!userRole, 
        match: roleMatch 
      });
    }
    return roleMatch;
  }

  /**
   * Get access token
   * Checks both the property and localStorage to ensure we have the token on refresh
   */
  getAccessToken(): string | null {
    if (this.accessToken) {
      return this.accessToken;
    }
    
    // If property is null, try to get from storage (e.g., on page refresh)
    const storedToken = this.getStoredAccessToken();
    if (storedToken) {
      // Update the property so future calls are faster
      this.accessToken = storedToken;
      return storedToken;
    }
    
    return null;
  }

  /**
   * Get refresh token
   * Checks both the property and localStorage to ensure we have the token on refresh
   */
  getRefreshToken(): string | null {
    if (this.refreshToken) {
      return this.refreshToken;
    }
    
    // If property is null, try to get from storage (e.g., on page refresh)
    const storedToken = this.getStoredRefreshToken();
    if (storedToken) {
      // Update the property so future calls are faster
      this.refreshToken = storedToken;
      return storedToken;
    }
    
    return null;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    // Store both tokens in localStorage (in production, use secure storage or httpOnly cookies)
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      if (!stored) return null;
      const user = JSON.parse(stored);
      // Map role if it's a number
      if (user && typeof user.role === 'number') {
        user.role = this.mapRoleFromBackend(user.role);
      }
      return user;
    } catch {
      return null;
    }
  }

  private getStoredAccessToken(): string | null {
    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private getStoredRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private removeStoredTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  private removeStoredUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }
}

