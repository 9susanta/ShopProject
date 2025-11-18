import { Component, OnInit, signal, inject, computed } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InventoryService } from '../services/inventory.service';
import { ProductInventory, InventoryBatch } from '@core/models/inventory-batch.model';

@Component({
  selector: 'grocery-product-batch-list',
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
    MatTooltipModule,
    MatCardModule,
    MatFormFieldModule,
  ],
  templateUrl: './product-batch-list.component.html',
  styleUrl: './product-batch-list.component.css',
})
export class ProductBatchListComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private router = inject(Router);

  products = signal<ProductInventory[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(20);
  searchTerm = signal('');

  displayedColumns: string[] = [
    'productName',
    'sku',
    'totalQuantity',
    'availableQuantity',
    'lowStock',
    'batches',
    'actions',
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    const filters: any = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    };

    // Add search filter if search term is provided
    if (this.searchTerm() && this.searchTerm().trim()) {
      filters.search = this.searchTerm().trim();
    }

    this.inventoryService.getProducts(filters).subscribe({
      next: (response) => {
        this.products.set(response.items);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadProducts();
  }

  onSearch(): void {
    this.pageNumber.set(1);
    this.loadProducts();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.pageNumber.set(1);
    this.loadProducts();
  }

  viewBatches(product: ProductInventory): void {
    const productId = product.productId || product.id;
    if (!productId) {
      console.error('Product ID is missing', product);
      return;
    }
    this.router.navigate(['/admin/inventory/product', productId, 'batches']);
  }

  viewDetails(product: ProductInventory): void {
    const productId = product.productId || product.id;
    if (!productId) {
      console.error('Product ID is missing', product);
      return;
    }
    this.router.navigate(['/admin/inventory/product', productId]);
  }

  getBatchSummary(batches: InventoryBatch[]): string {
    if (!batches || batches.length === 0) return 'No batches';
    const totalBatches = batches.length;
    const expiringSoon = batches.filter((b) => b.isExpiringSoon).length;
    if (expiringSoon > 0) {
      return `${totalBatches} batches (${expiringSoon} expiring soon)`;
    }
    return `${totalBatches} batch${totalBatches > 1 ? 'es' : ''}`;
  }

  hasExpiringBatches(batches: InventoryBatch[] | undefined): boolean {
    if (!batches || batches.length === 0) return false;
    return batches.some(b => b.isExpiringSoon);
  }
}

