import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@core/toast/toast.service';
import { InventoryAuditLog, AuditLogFilters, AuditAction } from '@core/models/audit.model';

@Component({
  selector: 'grocery-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.css',
})
export class AuditLogsComponent implements OnInit {
  private api = inject(ApiService);
  private toastService = inject(ToastService);

  logs = signal<InventoryAuditLog[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(20);
  filters = signal<AuditLogFilters>({ pageNumber: 1, pageSize: 20 });

  auditActions = [
    { value: AuditAction.StockIncrease, label: 'Stock Increase' },
    { value: AuditAction.StockDecrease, label: 'Stock Decrease' },
    { value: AuditAction.BatchCreated, label: 'Batch Created' },
    { value: AuditAction.BatchUpdated, label: 'Batch Updated' },
    { value: AuditAction.BatchExpired, label: 'Batch Expired' },
    { value: AuditAction.GRNConfirmed, label: 'GRN Confirmed' },
    { value: AuditAction.Adjustment, label: 'Adjustment' },
    { value: AuditAction.ReturnToSupplier, label: 'Return to Supplier' },
    { value: AuditAction.CustomerReturn, label: 'Customer Return' },
  ];

  displayedColumns: string[] = [
    'performedAt',
    'productName',
    'batchNumber',
    'action',
    'oldValue',
    'newValue',
    'quantityChange',
    'performedBy',
    'reason',
  ];

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.loading.set(true);
    const currentFilters = { ...this.filters(), pageNumber: this.pageNumber(), pageSize: this.pageSize() };

    this.api.get<any>('admin/audit/inventory', { params: currentFilters }).subscribe({
      next: (response: any) => {
        this.logs.set(response.items || response || []);
        this.totalCount.set(response.totalCount || 0);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load audit logs');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadAuditLogs();
  }

  applyFilters(): void {
    this.pageNumber.set(1);
    this.loadAuditLogs();
  }

  clearFilters(): void {
    this.filters.set({ pageNumber: 1, pageSize: this.pageSize() });
    this.pageNumber.set(1);
    this.loadAuditLogs();
  }

  getActionLabel(action: AuditAction): string {
    return this.auditActions.find((a) => a.value === action)?.label || action;
  }

  getActionColor(action: AuditAction): string {
    if (action === AuditAction.StockIncrease || action === AuditAction.BatchCreated) {
      return 'primary';
    }
    if (action === AuditAction.StockDecrease || action === AuditAction.BatchExpired) {
      return 'warn';
    }
    return 'accent';
  }
}

