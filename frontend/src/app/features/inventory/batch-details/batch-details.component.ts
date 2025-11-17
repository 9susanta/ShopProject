import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryService } from '../inventory.service';
import { ToastService } from '@core/toast/toast.service';
import { ProductInventory, InventoryBatch } from '@core/models/inventory-batch.model';

@Component({
  selector: 'grocery-batch-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="batch-details-container p-4 max-w-4xl mx-auto">
      <div class="mb-4">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (product()) {
        <mat-card class="mb-4">
          <mat-card-header>
            <mat-card-title>{{ product()!.productName }}</mat-card-title>
            <mat-card-subtitle>SKU: {{ product()!.productSKU }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <strong>Total Quantity:</strong> {{ product()!.totalQuantity }}
              </div>
              <div>
                <strong>Available:</strong> {{ product()!.availableQuantity }}
              </div>
              <div>
                <strong>Reserved:</strong> {{ product()!.reservedQuantity }}
              </div>
              @if (product()!.isLowStock) {
                <div>
                  <mat-chip color="warn">Low Stock</mat-chip>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Batches</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (product()!.batches && product()!.batches.length > 0) {
              <div class="space-y-4">
                @for (batch of product()!.batches; track batch.id) {
                  <div class="border rounded p-4">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <div class="font-semibold">Batch: {{ batch.batchNumber }}</div>
                        <div class="text-sm text-gray-500">Quantity: {{ batch.quantity }} | Available: {{ batch.availableQuantity }}</div>
                      </div>
                      @if (batch.isExpiringSoon) {
                        <mat-chip color="warn">
                          Expires in {{ batch.daysUntilExpiry }} days
                        </mat-chip>
                      }
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Unit Cost:</strong> {{ batch.unitCost | currency: 'INR' }}</div>
                      <div><strong>Expiry Date:</strong> @if (batch.expiryDate) { {{ batch.expiryDate | date: 'short' }} } @else { N/A }</div>
                      @if (batch.location) {
                        <div><strong>Location:</strong> {{ batch.location }}</div>
                      }
                    </div>
                    <div class="mt-4 flex gap-2">
                      <button mat-raised-button color="warn" (click)="markDamaged(batch.id)">
                        <mat-icon>cancel</mat-icon>
                        Mark Damaged
                      </button>
                      <button mat-raised-button color="accent" (click)="returnToSupplier(batch.id)">
                        <mat-icon>reply</mat-icon>
                        Return to Supplier
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="text-gray-500 text-center py-4">No batches found</p>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: ['.batch-details-container { min-height: calc(100vh - 64px); }'],
})
export class BatchDetailsComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  product = signal<ProductInventory | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  loadProduct(productId: string): void {
    this.loading.set(true);
    this.inventoryService.getProductById(productId).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load product');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  markDamaged(batchId: string): void {
    // TODO: Implement mark damaged API call
    this.toastService.info('Marking batch as damaged...');
  }

  returnToSupplier(batchId: string): void {
    // Navigate to supplier return form
    this.router.navigate(['/purchasing/grn/return'], {
      queryParams: { batchId },
    });
  }

  goBack(): void {
    this.router.navigate(['/inventory/products']);
  }
}

