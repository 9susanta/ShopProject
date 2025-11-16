import { Component, signal, inject, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { Subscription } from 'rxjs';

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

  // User profile signal
  currentUser = signal<User | null>(this.authService.getCurrentUser());
  
  // Computed values
  userName = computed(() => this.currentUser()?.name || 'User');
  userEmail = computed(() => this.currentUser()?.email || '');
  userRole = computed(() => this.currentUser()?.role || '');
  
  // Menu state
  isProfileMenuOpen = signal(false);

  // Navigation menu items
  menuItems = signal([
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Imports', route: '/admin/imports', icon: 'upload' },
    { label: 'Products', route: '/admin/products', icon: 'inventory_2' },
    { label: 'Inventory', route: '/admin/inventory', icon: 'warehouse' },
    { label: 'Sales', route: '/admin/sales', icon: 'point_of_sale' },
    { label: 'Customers', route: '/admin/customers', icon: 'people' },
    { label: 'Reports', route: '/admin/reports', icon: 'assessment' },
    { label: 'Settings', route: '/admin/settings', icon: 'settings' },
  ]);

  // Subscription and event listener cleanup
  private userSubscription?: Subscription;
  private clickHandler?: (event: MouseEvent) => void;

  constructor() {
    // Subscribe to user changes
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
    });

    // Close menu when clicking outside
    this.clickHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.header-profile')) {
        this.closeProfileMenu();
      }
    };
    document.addEventListener('click', this.clickHandler);
  }

  ngOnDestroy(): void {
    // Unsubscribe from user observable
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToProfile(): void {
    this.closeProfileMenu();
    // TODO: Navigate to profile page when created
    // this.router.navigate(['/admin/profile']);
  }
}

