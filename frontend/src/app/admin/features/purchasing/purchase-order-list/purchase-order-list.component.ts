import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { PurchasingService } from '@core/services/purchasing.service';
import { ToastService } from '@core/toast/toast.service';
import {
  PurchaseOrder,
  PurchaseOrderListResponse,
  PurchaseOrderFilters,
  PurchaseOrderStatus,
  Supplier,
} from '@core/models/purchasing.model';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'grocery-purchase-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatCardModule,
  ],
  templateUrl: './purchase-order-list.component.html',
  styleUrl: './purchase-order-list.component.css',
})
export class PurchaseOrderListComponent implements OnInit {
  private purchasingService = inject(PurchasingService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private authService = inject(AuthService);

  // State
  purchaseOrders = signal<PurchaseOrder[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(20);

  // Suppliers for dropdown
  suppliers = signal<Supplier[]>([]);
  loadingSuppliers = signal(false);

  // Filter values (using individual signals for proper two-way binding)
  selectedSupplierId = signal<string | null>(null);
  selectedStatus = signal<PurchaseOrderStatus | null>(null);
  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);

  // Selection for bulk operations
  selectedPOs = signal<Set<string>>(new Set());

  // Computed
  isAdmin = computed(() => 
    this.authService.hasRole('Admin') || 
    this.authService.hasRole('SuperAdmin') || 
    this.authService.isAdmin() || 
    this.authService.isSuperAdmin()
  );
  hasSelection = computed(() => this.selectedPOs().size > 0);
  allSelected = computed(() => {
    const selected = this.selectedPOs();
    return selected.size > 0 && selected.size === this.purchaseOrders().length;
  });

  // Filter state
  hasActiveFilters = computed(() => {
    return this.selectedSupplierId() !== null ||
           this.selectedStatus() !== null ||
           this.fromDate() !== null ||
           this.toDate() !== null;
  });

  getActiveFilterCount(): number {
    let count = 0;
    if (this.selectedSupplierId() !== null) count++;
    if (this.selectedStatus() !== null) count++;
    if (this.fromDate() !== null) count++;
    if (this.toDate() !== null) count++;
    return count;
  }

  // Status options
  statusOptions = [
    { value: PurchaseOrderStatus.Draft, label: 'Draft' },
    { value: PurchaseOrderStatus.Pending, label: 'Pending' },
    { value: PurchaseOrderStatus.Approved, label: 'Approved' },
    { value: PurchaseOrderStatus.Received, label: 'Received' },
    { value: PurchaseOrderStatus.Cancelled, label: 'Cancelled' },
  ];

  baseColumns = [
    'orderNumber',
    'supplierName',
    'orderDate',
    'expectedDeliveryDate',
    'status',
    'totalAmount',
    'actions',
  ];

  displayedColumns = computed(() => {
    if (this.isAdmin()) {
      return ['select', ...this.baseColumns];
    } else {
      return this.baseColumns;
    }
  });

  PurchaseOrderStatus = PurchaseOrderStatus;

  getStatusLabel(status: PurchaseOrderStatus): string {
    const statusOption = this.statusOptions.find((s) => s.value === status);
    return statusOption?.label || 'Unknown';
  }

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadPurchaseOrders();
  }

  loadSuppliers(): void {
    this.loadingSuppliers.set(true);
    this.purchasingService.getSuppliers().subscribe({
      next: (response) => {
        this.suppliers.set(response.items);
        this.loadingSuppliers.set(false);
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.toastService.error('Failed to load suppliers');
        this.loadingSuppliers.set(false);
      },
    });
  }

  loadPurchaseOrders(): void {
    this.loading.set(true);
    
    // Build filters object with proper mapping to backend parameter names
    const filters: any = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    };

    // Add supplier filter
    if (this.selectedSupplierId()) {
      filters.supplierId = this.selectedSupplierId()!;
    }

    // Add status filter (convert enum to string for backend)
    if (this.selectedStatus() !== null) {
      const statusOption = this.statusOptions.find(s => s.value === this.selectedStatus());
      filters.status = statusOption?.label || PurchaseOrderStatus[this.selectedStatus()!];
    }

    // Add date filters (convert Date to ISO string and map to backend parameter names)
    if (this.fromDate()) {
      filters.startDate = this.fromDate()!.toISOString();
    }
    if (this.toDate()) {
      filters.endDate = this.toDate()!.toISOString();
    }

    this.purchasingService.getPurchaseOrders(filters).subscribe({
      next: (response: PurchaseOrderListResponse) => {
        this.purchaseOrders.set(response.items);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load purchase orders');
        this.loading.set(false);
        console.error('Error loading purchase orders:', error);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadPurchaseOrders();
  }

  applyFilters(): void {
    this.pageNumber.set(1);
    this.loadPurchaseOrders();
  }

  clearFilters(): void {
    this.selectedSupplierId.set(null);
    this.selectedStatus.set(null);
    this.fromDate.set(null);
    this.toDate.set(null);
    this.pageNumber.set(1);
    this.loadPurchaseOrders();
  }

  toggleSelect(poId: string): void {
    const selected = new Set(this.selectedPOs());
    if (selected.has(poId)) {
      selected.delete(poId);
    } else {
      selected.add(poId);
    }
    this.selectedPOs.set(selected);
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedPOs.set(new Set());
    } else {
      this.selectedPOs.set(new Set(this.purchaseOrders().map((po) => po.id)));
    }
  }

  bulkApprove(): void {
    const selectedIds = Array.from(this.selectedPOs());
    if (selectedIds.length === 0) {
      return;
    }

    // Filter to only pending orders
    const pendingPOs = this.purchaseOrders().filter(
      (po) => selectedIds.includes(po.id) && po.status === PurchaseOrderStatus.Pending
    );

    if (pendingPOs.length === 0) {
      this.toastService.warning('No pending orders selected');
      return;
    }

    this.loading.set(true);
    const approvals = pendingPOs.map((po) => this.purchasingService.approvePurchaseOrder(po.id));

    Promise.all(approvals.map((obs) => obs.toPromise())).then(() => {
      this.toastService.success(`Approved ${pendingPOs.length} purchase order(s)`);
      this.selectedPOs.set(new Set());
      this.loadPurchaseOrders();
    });
  }

  getStatusColor(status: PurchaseOrderStatus): string {
    switch (status) {
      case PurchaseOrderStatus.Draft:
        return 'gray';
      case PurchaseOrderStatus.Pending:
        return 'orange';
      case PurchaseOrderStatus.Approved:
        return 'blue';
      case PurchaseOrderStatus.Received:
        return 'green';
      case PurchaseOrderStatus.Cancelled:
        return 'red';
      default:
        return 'gray';
    }
  }

  createNew(): void {
    this.router.navigate(['/admin/purchasing/purchase-orders/new']);
  }

  viewDetails(id: string): void {
    this.router.navigate(['/admin/purchasing/purchase-orders', id]);
  }

  edit(id: string): void {
    this.router.navigate(['/admin/purchasing/purchase-orders', id, 'edit']);
  }
}

