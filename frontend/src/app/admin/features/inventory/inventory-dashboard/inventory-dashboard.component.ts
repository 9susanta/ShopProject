import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { InventoryService } from '../services/inventory.service';
import { PurchasingService } from '@core/services/purchasing.service';
import { StockValuation, LowStockProduct, ExpirySoonBatch } from '@core/models/inventory-batch.model';
import { SignalRService } from '@core/services/signalr.service';
import { ToastService } from '@core/toast/toast.service';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/user.model';
import { environment } from '@environments/environment';
import { PurchaseOrder, GoodsReceiveNote, PurchaseOrderStatus, GRNStatus } from '@core/models/purchasing.model';

@Component({
  selector: 'grocery-inventory-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
  ],
  templateUrl: './inventory-dashboard.component.html',
  styleUrl: './inventory-dashboard.component.css',
})
export class InventoryDashboardComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private purchasingService = inject(PurchasingService);
  private signalRService = inject(SignalRService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  valuation = signal<StockValuation | null>(null);
  lowStockCount = signal(0);
  expirySoonCount = signal(0);
  hasAccess = signal(false);
  
  // Purchase Order and GRN data
  recentPurchaseOrders = signal<PurchaseOrder[]>([]);
  recentGRNs = signal<GoodsReceiveNote[]>([]);
  loadingPOs = signal(false);
  loadingGRNs = signal(false);

  // Computed values for display
  totalSKUs = computed(() => this.valuation()?.totalSKUs || 0);
  totalStockValue = computed(() => this.valuation()?.totalStockValue || 0);
  totalQuantity = computed(() => this.valuation()?.totalQuantity || 0);

  ngOnInit(): void {
    // Check if user has required role (SuperAdmin, Admin, or Staff)
    // SuperAdmin has full access to all inventory features
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.hasAccess.set(false);
      this.toastService.error('You must be logged in to access inventory data.');
      return;
    }
    
    // Prioritize SuperAdmin check first, then Admin, then Staff
    // SuperAdmin has full access to everything
    const isSuperAdmin = this.authService.isSuperAdmin() || 
                        this.authService.hasRole('SuperAdmin') ||
                        user.role === UserRole.SuperAdmin ||
                        String(user.role).toLowerCase() === 'superadmin';
    
    const isAdmin = this.authService.isAdmin() || 
                   this.authService.hasRole('Admin') ||
                   user.role === UserRole.Admin ||
                   String(user.role).toLowerCase() === 'admin';
    
    const isStaff = this.authService.hasRole('Staff') ||
                   user.role === UserRole.Staff ||
                   String(user.role).toLowerCase() === 'staff';
    
    // Allow access if user is SuperAdmin, Admin, or Staff
    const hasRequiredRole = isSuperAdmin || isAdmin || isStaff;
    
    this.hasAccess.set(hasRequiredRole);
    
    if (!hasRequiredRole) {
      console.warn('Inventory access denied:', {
        userRole: user.role,
        roleType: typeof user.role,
        isSuperAdmin,
        isAdmin,
        isStaff,
        hasAdminRole: this.authService.hasRole('Admin'),
        hasSuperAdminRole: this.authService.hasRole('SuperAdmin'),
        hasStaffRole: this.authService.hasRole('Staff'),
        isAdminMethod: this.authService.isAdmin(),
        isSuperAdminMethod: this.authService.isSuperAdmin(),
      });
      this.toastService.error('You do not have permission to access inventory data. SuperAdmin, Admin, or Staff role required.');
      return;
    }
    
    // Log successful access for debugging
    if (!environment.production) {
      console.debug('Inventory access granted:', {
        userRole: user.role,
        isSuperAdmin,
        isAdmin,
        isStaff,
      });
    }
    
    this.loadDashboardData();
    this.loadRecentPurchaseOrders();
    this.loadRecentGRNs();
    this.setupSignalRSubscriptions();
  }

  loadDashboardData(): void {
    // Don't load data if user doesn't have access
    if (!this.hasAccess()) {
      return;
    }

    this.loading.set(true);

    // Load valuation
    this.inventoryService.getValuation('FIFO').subscribe({
      next: (val) => {
        this.valuation.set(val);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading valuation:', error);
        if (error.status === 401 || error.status === 403) {
          this.hasAccess.set(false);
          this.toastService.error('Access denied. Please log out and log back in with an Admin or Staff account to refresh your permissions.');
        }
        this.loading.set(false);
      },
    });

    // Load low stock count
    this.inventoryService.getLowStock().subscribe({
      next: (response) => {
        this.lowStockCount.set(response.totalCount);
      },
      error: (error) => {
        console.error('Error loading low stock:', error);
        if (error.status === 401 || error.status === 403) {
          this.hasAccess.set(false);
          // Don't show toast for every failed request, just log it
          console.warn('Access denied for low stock endpoint');
        }
      },
    });

    // Load expiry soon count
    this.inventoryService.getExpirySoon(7).subscribe({
      next: (response) => {
        this.expirySoonCount.set(response.totalCount);
      },
      error: (error) => {
        console.error('Error loading expiry soon:', error);
        if (error.status === 401 || error.status === 403) {
          this.hasAccess.set(false);
          // Don't show toast for every failed request, just log it
          console.warn('Access denied for expiry soon endpoint');
        }
      },
    });
  }

  setupSignalRSubscriptions(): void {
    // Subscribe to low stock alerts
    this.signalRService.lowStockAlert$.subscribe((event) => {
      this.toastService.warning(`${event.productName} is low on stock! Current: ${event.currentStock}, Threshold: ${event.threshold}`);
      // Refresh low stock count
      this.inventoryService.getLowStock().subscribe({
        next: (response) => this.lowStockCount.set(response.totalCount),
      });
    });

    // Subscribe to expiry alerts
    this.signalRService.expiryAlert$.subscribe((event) => {
      this.toastService.warning(`${event.productName} (Batch ${event.batchNumber}) expires in ${event.daysUntilExpiry} days!`);
      // Refresh expiry count
      this.inventoryService.getExpirySoon(7).subscribe({
        next: (response) => this.expirySoonCount.set(response.totalCount),
      });
    });
  }

  loadRecentPurchaseOrders(): void {
    this.loadingPOs.set(true);
    this.purchasingService.getPurchaseOrders({
      pageNumber: 1,
      pageSize: 5,
      status: PurchaseOrderStatus.Approved,
    }).subscribe({
      next: (response) => {
        this.recentPurchaseOrders.set(response.items);
        this.loadingPOs.set(false);
      },
      error: (error) => {
        console.error('Error loading purchase orders:', error);
        this.loadingPOs.set(false);
      },
    });
  }

  loadRecentGRNs(): void {
    this.loadingGRNs.set(true);
    this.purchasingService.getGRNs({
      pageNumber: 1,
      pageSize: 5,
      status: GRNStatus.Confirmed,
    }).subscribe({
      next: (response) => {
        this.recentGRNs.set(response.items);
        this.loadingGRNs.set(false);
      },
      error: (error) => {
        console.error('Error loading GRNs:', error);
        this.loadingGRNs.set(false);
      },
    });
  }

  refresh(): void {
    this.loadDashboardData();
    this.loadRecentPurchaseOrders();
    this.loadRecentGRNs();
  }

  viewPurchaseOrder(poId: string): void {
    this.router.navigate(['/admin/purchasing/purchase-orders', poId]);
  }

  viewGRN(grnId: string): void {
    this.router.navigate(['/admin/purchasing/grn', grnId]);
  }

  getPOStatusText(status: PurchaseOrderStatus): string {
    switch (status) {
      case PurchaseOrderStatus.Draft:
        return 'Draft';
      case PurchaseOrderStatus.Pending:
        return 'Pending';
      case PurchaseOrderStatus.Approved:
        return 'Approved';
      case PurchaseOrderStatus.Received:
        return 'Received';
      case PurchaseOrderStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getPOStatusColor(status: PurchaseOrderStatus): string {
    switch (status) {
      case PurchaseOrderStatus.Approved:
        return 'primary';
      case PurchaseOrderStatus.Received:
        return 'accent';
      case PurchaseOrderStatus.Cancelled:
        return 'warn';
      default:
        return '';
    }
  }

  getGRNStatusText(status: GRNStatus): string {
    switch (status) {
      case GRNStatus.Draft:
        return 'Draft';
      case GRNStatus.Confirmed:
        return 'Confirmed';
      case GRNStatus.Cancelled:
        return 'Cancelled';
      case GRNStatus.Voided:
        return 'Voided';
      default:
        return 'Unknown';
    }
  }

  getGRNStatusColor(status: GRNStatus): string {
    switch (status) {
      case GRNStatus.Confirmed:
        return 'primary';
      case GRNStatus.Cancelled:
      case GRNStatus.Voided:
        return 'warn';
      default:
        return '';
    }
  }
}

