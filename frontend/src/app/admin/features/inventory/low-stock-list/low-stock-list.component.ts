import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { InventoryService } from '../services/inventory.service';
import { PurchasingService } from '@core/services/purchasing.service';
import { ToastService } from '@core/toast/toast.service';
import { LowStockProduct } from '@core/models/inventory-batch.model';

@Component({
  selector: 'grocery-low-stock-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './low-stock-list.component.html',
  styleUrl: './low-stock-list.component.css',
})
export class LowStockListComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private purchasingService = inject(PurchasingService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  products = signal<LowStockProduct[]>([]);
  loading = signal(false);

  displayedColumns: string[] = ['productName', 'sku', 'currentStock', 'threshold', 'unit', 'deficit', 'actions'];

  ngOnInit(): void {
    this.loadLowStock();
  }

  loadLowStock(): void {
    this.loading.set(true);
    this.inventoryService.getLowStock().subscribe({
      next: (response) => {
        this.products.set(response.items);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load low stock products');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  getDeficit(product: LowStockProduct): number {
    return Math.max(0, product.threshold - product.currentStock);
  }

  createPO(product: LowStockProduct): void {
    // Navigate to PO form with suggested quantity
    const suggestedQty = this.getDeficit(product) * 2; // Suggest 2x the deficit
    this.router.navigate(['/purchasing/purchase-orders/new'], {
      queryParams: {
        productId: product.productId,
        suggestedQty: suggestedQty,
      },
    });
  }

  createPOForAll(): void {
    // Create PO with all low stock items
    this.router.navigate(['/purchasing/purchase-orders/new'], {
      queryParams: {
        lowStock: true,
      },
    });
  }
}

