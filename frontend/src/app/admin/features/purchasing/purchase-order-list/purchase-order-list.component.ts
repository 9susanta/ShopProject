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
import { PurchasingService } from '@core/services/purchasing.service';
import { ToastService } from '@core/toast/toast.service';
import {
  PurchaseOrder,
  PurchaseOrderListResponse,
  PurchaseOrderFilters,
  PurchaseOrderStatus,
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

  // Filters
  filters = signal<PurchaseOrderFilters>({
    pageNumber: 1,
    pageSize: 20,
  });

  // Selection for bulk operations
  selectedPOs = signal<Set<string>>(new Set());

  // Computed
  isAdmin = computed(() => this.authService.hasRole('Admin'));
  hasSelection = computed(() => this.selectedPOs().size > 0);
  allSelected = computed(() => {
    const selected = this.selectedPOs();
    return selected.size > 0 && selected.size === this.purchaseOrders().length;
  });

  // Status options
  statusOptions = [
    { value: PurchaseOrderStatus.Draft, label: 'Draft' },
    { value: PurchaseOrderStatus.Pending, label: 'Pending' },
    { value: PurchaseOrderStatus.Approved, label: 'Approved' },
    { value: PurchaseOrderStatus.Received, label: 'Received' },
    { value: PurchaseOrderStatus.Cancelled, label: 'Cancelled' },
  ];

  displayedColumns: string[] = [
    'select',
    'orderNumber',
    'supplierName',
    'orderDate',
    'expectedDeliveryDate',
    'status',
    'totalAmount',
    'actions',
  ];

  PurchaseOrderStatus = PurchaseOrderStatus;

  getStatusLabel(status: PurchaseOrderStatus): string {
    const statusOption = this.statusOptions.find((s) => s.value === status);
    return statusOption?.label || 'Unknown';
  }

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders(): void {
    this.loading.set(true);
    const currentFilters = { ...this.filters(), pageNumber: this.pageNumber(), pageSize: this.pageSize() };

    this.purchasingService.getPurchaseOrders(currentFilters).subscribe({
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
    this.filters.set({ pageNumber: 1, pageSize: this.pageSize() });
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
    this.router.navigate(['/purchasing/purchase-orders/new']);
  }

  viewDetails(id: string): void {
    this.router.navigate(['/purchasing/purchase-orders', id]);
  }

  edit(id: string): void {
    this.router.navigate(['/purchasing/purchase-orders', id, 'edit']);
  }
}

