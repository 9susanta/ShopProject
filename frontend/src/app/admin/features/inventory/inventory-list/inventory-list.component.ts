import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventoryService } from '../services/inventory.service';
import { ToastService } from '@core/toast/toast.service';
import { Inventory, InventoryFilters } from '@core/models/inventory.model';

@Component({
  selector: 'grocery-inventory-list',
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
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.css',
})
export class InventoryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  inventories = signal<Inventory[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(20);
  
  // Filters
  filters = signal<InventoryFilters>({
    lowStock: false,
    expirySoon: false,
  });

  displayedColumns: string[] = [
    'productName',
    'quantityOnHand',
    'availableQuantity',
    'reservedQuantity',
    'batchNumber',
    'expiryDate',
    'location',
    'actions',
  ];

  ngOnInit(): void {
    this.loadInventories();
  }

  loadInventories(): void {
    this.loading.set(true);
    const filters: InventoryFilters = {
      ...this.filters(),
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    };

    this.inventoryService.getInventories(filters).subscribe({
      next: (response) => {
        this.inventories.set(response.items);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load inventory');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadInventories();
  }

  applyFilters(): void {
    this.pageNumber.set(1);
    this.loadInventories();
  }

  clearFilters(): void {
    this.filters.set({
      lowStock: false,
      expirySoon: false,
    });
    this.pageNumber.set(1);
    this.loadInventories();
  }

  viewProduct(productId: string): void {
    this.router.navigate(['/admin/inventory/product', productId]);
  }

  adjustInventory(inventory: Inventory): void {
    this.router.navigate(['/admin/inventory/adjust'], {
      queryParams: { inventoryId: inventory.id, productId: inventory.productId },
    });
  }

  isExpiringSoon(expiryDate: string): boolean {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  }
}
