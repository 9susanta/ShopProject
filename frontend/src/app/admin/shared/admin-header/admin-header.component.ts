import { Component, signal, inject, computed, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { ToastService } from '../../../core/toast/toast.service';
import { User } from '../../../core/models/user.model';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'grocery-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css'],
})
export class AdminHeaderComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private signalRService = inject(SignalRService);
  private toastService = inject(ToastService);

  // User profile signal
  currentUser = signal<User | null>(this.authService.getCurrentUser());
  
  // Computed values
  userName = computed(() => this.currentUser()?.name || 'User');
  userEmail = computed(() => this.currentUser()?.email || '');
  userRole = computed(() => this.currentUser()?.role || '');
  
  // Menu state
  isProfileMenuOpen = signal(false);
  openDropdown = signal<string | null>(null);
  isMobileMenuOpen = signal(false);

  // Dropdown close timeout to prevent premature closing
  private dropdownCloseTimeout: ReturnType<typeof setTimeout> | null = null;

  // Subscription and event listener cleanup
  private userSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private clickHandler?: (event: MouseEvent) => void;

  constructor() {
    // Subscribe to user changes
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
    });

    // Close menus on route change
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isMobileMenuOpen.set(false);
      this.closeDropdown();
    });

    // Close menu when clicking outside
    this.clickHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.header-profile')) {
        this.closeProfileMenu();
      }
      // Only close dropdown if click is outside both the trigger and the menu
      const navDropdown = target.closest('.nav-dropdown');
      if (!navDropdown) {
        this.closeDropdown();
      }
    };
    document.addEventListener('click', this.clickHandler);
  }

  ngOnDestroy(): void {
    // Clear any pending timeout
    if (this.dropdownCloseTimeout) {
      clearTimeout(this.dropdownCloseTimeout);
      this.dropdownCloseTimeout = null;
    }

    // Unsubscribe from user observable
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    // Unsubscribe from router events
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    // Remove click event listener
    if (this.clickHandler) {
      document.removeEventListener('click', this.clickHandler);
    }
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update((value) => !value);
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen.set(false);
  }

  setPointerCursor(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.setProperty('cursor', 'pointer', 'important');
    }
  }

  logout(): void {
    // Close profile menu
    this.closeProfileMenu();
    
    // Logout user first (clears tokens and user data)
    this.authService.logout();
    
    // Disconnect SignalR connections (non-blocking)
    this.signalRService.dispose().catch((error) => {
      console.warn('Error disconnecting SignalR on logout:', error);
    });
    
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
    
    // Navigate to login page immediately
    this.router.navigate(['/login'], { 
      replaceUrl: true,
      skipLocationChange: false 
    }).then(() => {
      // Show success message after navigation
      this.toastService.success('Logged out successfully');
    }).catch((error) => {
      // If navigation fails, still show message and try window.location as fallback
      console.warn('Router navigation failed, using window.location:', error);
      this.toastService.success('Logged out successfully');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    });
  }

  navigateToProfile(): void {
    this.closeProfileMenu();
    this.router.navigate(['/admin/profile']);
  }

  // Dropdown management
  toggleDropdown(menu: string): void {
    if (this.openDropdown() === menu) {
      this.openDropdown.set(null);
    } else {
      this.openDropdown.set(menu);
    }
  }

  closeDropdown(): void {
    // Clear any pending timeout
    if (this.dropdownCloseTimeout) {
      clearTimeout(this.dropdownCloseTimeout);
      this.dropdownCloseTimeout = null;
    }
    this.openDropdown.set(null);
  }

  // Handle dropdown container mouse enter - open dropdown
  onDropdownMouseEnter(menu: string): void {
    // Cancel any pending close timeout
    if (this.dropdownCloseTimeout) {
      clearTimeout(this.dropdownCloseTimeout);
      this.dropdownCloseTimeout = null;
    }
    // Open the dropdown
    this.openDropdown.set(menu);
  }

  // Handle dropdown container mouse leave - delay close to allow moving to menu
  onDropdownMouseLeave(menu: string, event: MouseEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement;
    // Check if mouse is moving to the dropdown menu
    if (relatedTarget && relatedTarget.closest('.dropdown-menu')) {
      return; // Don't close if moving to menu
    }
    
    // Clear any existing timeout
    if (this.dropdownCloseTimeout) {
      clearTimeout(this.dropdownCloseTimeout);
    }
    // Set a delay before closing (allows time to move mouse to dropdown menu)
    this.dropdownCloseTimeout = setTimeout(() => {
      // Only close if this menu is still the open one
      if (this.openDropdown() === menu) {
        this.openDropdown.set(null);
      }
      this.dropdownCloseTimeout = null;
    }, 300); // 300ms delay - enough time to move mouse to menu
  }

  // Handle dropdown menu mouse enter - keep it open
  onDropdownMenuMouseEnter(menu: string): void {
    // Cancel any pending close timeout
    if (this.dropdownCloseTimeout) {
      clearTimeout(this.dropdownCloseTimeout);
      this.dropdownCloseTimeout = null;
    }
    // Ensure dropdown stays open
    this.openDropdown.set(menu);
  }

  // Handle dropdown menu mouse leave - close it
  onDropdownMenuMouseLeave(menu: string): void {
    // Clear any existing timeout
    if (this.dropdownCloseTimeout) {
      clearTimeout(this.dropdownCloseTimeout);
    }
    // Close immediately when leaving the menu
    if (this.openDropdown() === menu) {
      this.openDropdown.set(null);
    }
    this.dropdownCloseTimeout = null;
  }

  // Mobile menu management
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    this.closeDropdown();
  }

  // Role-based menu access
  canAccessMenu(menu: string): boolean {
    const user = this.currentUser();
    if (!user) return false;

    const role = user.role;
    const isAdmin = role === 'Admin' || role === 'SuperAdmin';

    // Admin/SuperAdmin can access everything
    if (isAdmin) {
      return true;
    }

    // Staff permissions
    if (role === 'Staff') {
      const allowedMenus = ['inventory', 'purchasing', 'sales', 'reports'];
      return allowedMenus.includes(menu);
    }

    return false;
  }

  // Close dropdown when clicking outside (additional handler)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Only close if click is outside both the trigger button and the dropdown menu
    const navDropdown = target.closest('.nav-dropdown');
    if (!navDropdown) {
      this.closeDropdown();
    }
  }
}

