import { Component, OnInit, signal, inject } from '@angular/core';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventoryService } from '@features/inventory/inventory.service';
import { ToastService } from '@core/toast/toast.service';
import { InventoryAdjustment, AdjustmentFilters, InventoryAdjustmentType } from '@core/models/inventory-batch.model';

@Component({
  selector: 'grocery-adjustment-history',
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
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './adjustment-history.component.html',
  styleUrl: './adjustment-history.component.css',
})
export class AdjustmentHistoryComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  adjustments = signal<InventoryAdjustment[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(20);
  filters = signal<AdjustmentFilters>({ pageNumber: 1, pageSize: 20 });

  adjustmentTypes = [
    { value: InventoryAdjustmentType.Manual, label: 'Manual' },
    { value: InventoryAdjustmentType.Damage, label: 'Damage' },
    { value: InventoryAdjustmentType.Expiry, label: 'Expiry' },
    { value: InventoryAdjustmentType.SupplierReturn, label: 'Supplier Return' },
    { value: InventoryAdjustmentType.CustomerReturn, label: 'Customer Return' },
    { value: InventoryAdjustmentType.StockTake, label: 'Stock Take' },
    { value: InventoryAdjustmentType.Transfer, label: 'Transfer' },
  ];

  displayedColumns: string[] = [
    'adjustedAt',
    'productName',
    'batchNumber',
    'adjustmentType',
    'quantityChange',
    'reason',
    'adjustedBy',
    'actions',
  ];

  ngOnInit(): void {
    this.loadAdjustments();
  }

  loadAdjustments(): void {
    this.loading.set(true);
    const currentFilters = { ...this.filters(), pageNumber: this.pageNumber(), pageSize: this.pageSize() };

    this.inventoryService.getAdjustments(currentFilters).subscribe({
      next: (response) => {
        this.adjustments.set(response.items);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load adjustments');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadAdjustments();
  }

  applyFilters(): void {
    this.pageNumber.set(1);
    this.loadAdjustments();
  }

  clearFilters(): void {
    this.filters.set({ pageNumber: 1, pageSize: this.pageSize() });
    this.pageNumber.set(1);
    this.loadAdjustments();
  }

  getAdjustmentTypeLabel(type: InventoryAdjustmentType): string {
    return this.adjustmentTypes.find((t) => t.value === type)?.label || 'Unknown';
  }

  getQuantityColor(change: number): string {
    return change > 0 ? 'green' : 'red';
  }
}

