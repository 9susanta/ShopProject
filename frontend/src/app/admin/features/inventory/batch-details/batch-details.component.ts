import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../services/inventory.service';
import { ToastService } from '@core/toast/toast.service';
import { ProductInventory, InventoryBatch, InventoryAdjustmentType } from '@core/models/inventory-batch.model';

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
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './batch-details.component.html',
  styleUrls: ['./batch-details.component.css'],
})
export class BatchDetailsComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  product = signal<ProductInventory | null>(null);
  loading = signal(false);
  adjustments = signal<any[]>([]);
  loadingAdjustments = signal(false);
  
  // Damage adjustment dialog state
  showDamageDialog = signal(false);
  damageQuantity = signal(0);
  damageReason = signal('');
  selectedBatchId = signal<string | null>(null);

  // Computed signal for selected batch available quantity
  selectedBatchAvailableQuantity = signal(0);

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
        this.loadAdjustments(productId);
      },
      error: (error) => {
        this.toastService.error('Failed to load product');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  loadAdjustments(productId: string): void {
    this.loadingAdjustments.set(true);
    this.inventoryService.getAdjustments({ productId, pageSize: 10 }).subscribe({
      next: (response) => {
        this.adjustments.set(response.items);
        this.loadingAdjustments.set(false);
      },
      error: (error) => {
        console.error('Error loading adjustments:', error);
        this.loadingAdjustments.set(false);
      },
    });
  }

  markDamaged(batchId: string): void {
    const batch = this.product()?.batches.find(b => b.id === batchId);
    if (!batch) return;
    
    this.selectedBatchId.set(batchId);
    this.selectedBatchAvailableQuantity.set(batch.availableQuantity || 0);
    this.damageQuantity.set(0);
    this.damageReason.set('');
    this.showDamageDialog.set(true);
  }

  confirmDamage(): void {
    const batchId = this.selectedBatchId();
    const productId = this.product()?.productId;
    if (!batchId || !productId) return;

    const quantity = this.damageQuantity();
    const reason = this.damageReason().trim();

    if (quantity <= 0) {
      this.toastService.error('Please enter a valid quantity');
      return;
    }

    if (!reason) {
      this.toastService.error('Please enter a reason for damage');
      return;
    }

    const request = {
      productId,
      batchId,
      adjustmentType: InventoryAdjustmentType.Damage,
      quantityChange: -quantity,
      reason: `Damage: ${reason}`,
      notes: `Batch ${this.product()?.batches.find(b => b.id === batchId)?.batchNumber} marked as damaged`,
    };

    this.inventoryService.createAdjustment(request).subscribe({
      next: () => {
        this.toastService.success('Batch marked as damaged successfully');
        this.showDamageDialog.set(false);
        this.loadProduct(productId);
      },
      error: (error) => {
        this.toastService.error('Failed to mark batch as damaged');
        console.error(error);
      },
    });
  }

  cancelDamage(): void {
    this.showDamageDialog.set(false);
    this.selectedBatchId.set(null);
    this.damageQuantity.set(0);
    this.damageReason.set('');
  }

  returnToSupplier(batchId: string): void {
    // Navigate to supplier return form
    this.router.navigate(['/admin/purchasing/grn/return'], {
      queryParams: { batchId },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/inventory/products']);
  }
}

