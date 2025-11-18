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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { InventoryService } from '../services/inventory.service';
import { SignalRService } from '@core/services/signalr.service';
import { ToastService } from '@core/toast/toast.service';
import { ExpirySoonBatch, InventoryAdjustmentType } from '@core/models/inventory-batch.model';

@Component({
  selector: 'grocery-expiry-list',
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
    MatProgressSpinnerModule,
    MatCardModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  templateUrl: './expiry-list.component.html',
  styleUrl: './expiry-list.component.css',
})
export class ExpiryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private signalRService = inject(SignalRService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  batches = signal<ExpirySoonBatch[]>([]);
  loading = signal(false);
  daysAhead = signal(7);
  selectedBatches = signal<Set<string>>(new Set());
  expiryNotifications = signal<number>(0);

  displayedColumns: string[] = ['select', 'productName', 'batchNumber', 'quantity', 'expiryDate', 'daysUntilExpiry', 'actions'];

  ngOnInit(): void {
    this.loadExpirySoon();
    this.setupExpiryNotifications();
  }

  setupExpiryNotifications(): void {
    // Subscribe to expiry alerts from SignalR
    this.signalRService.expiryAlert$.subscribe((event) => {
      this.toastService.warning(
        `⚠️ ${event.productName} (Batch ${event.batchNumber}) expires in ${event.daysUntilExpiry} days!`,
        10000
      );
      // Refresh the list to show updated data
      this.loadExpirySoon();
    });
  }

  loadExpirySoon(): void {
    this.loading.set(true);
    this.inventoryService.getExpirySoon(this.daysAhead()).subscribe({
      next: (response) => {
        this.batches.set(response.items);
        // Count urgent expiries (within 3 days)
        const urgentCount = response.items.filter(b => b.daysUntilExpiry <= 3).length;
        this.expiryNotifications.set(urgentCount);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load expiring batches');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  onDaysAheadChange(): void {
    this.loadExpirySoon();
  }

  toggleSelect(batchId: string): void {
    const selected = new Set(this.selectedBatches());
    if (selected.has(batchId)) {
      selected.delete(batchId);
    } else {
      selected.add(batchId);
    }
    this.selectedBatches.set(selected);
  }

  toggleSelectAll(): void {
    if (this.selectedBatches().size === this.batches().length) {
      this.selectedBatches.set(new Set());
    } else {
      this.selectedBatches.set(new Set(this.batches().map((b) => b.batchId)));
    }
  }

  markExpired(): void {
    const selectedIds = Array.from(this.selectedBatches());
    if (selectedIds.length === 0) {
      this.toastService.warning('Please select batches to mark as expired');
      return;
    }

    // Mark each selected batch as expired using inventory adjustment
    const batches = this.batches().filter(b => selectedIds.includes(b.batchId));
    let completed = 0;
    let failed = 0;

    batches.forEach(batch => {
      const request = {
        productId: batch.productId,
        batchId: batch.batchId,
        adjustmentType: InventoryAdjustmentType.Expiry,
        quantityChange: -batch.quantity,
        reason: `Batch expired - ${batch.expiryDate}`,
        notes: `Batch ${batch.batchNumber} marked as expired`,
      };

      this.inventoryService.createAdjustment(request).subscribe({
        next: () => {
          completed++;
          if (completed + failed === batches.length) {
            if (failed === 0) {
              this.toastService.success(`Successfully marked ${completed} batch(es) as expired`);
            } else {
              this.toastService.warning(`Marked ${completed} batch(es) as expired, ${failed} failed`);
            }
            this.loadExpirySoon();
            this.selectedBatches.set(new Set());
          }
        },
        error: (error) => {
          failed++;
          console.error('Error marking batch as expired:', error);
          if (completed + failed === batches.length) {
            this.toastService.warning(`Marked ${completed} batch(es) as expired, ${failed} failed`);
            this.loadExpirySoon();
            this.selectedBatches.set(new Set());
          }
        },
      });
    });
  }

  createReturn(): void {
    const selectedIds = Array.from(this.selectedBatches());
    if (selectedIds.length === 0) {
      this.toastService.warning('Please select batches to return');
      return;
    }

    // Navigate to supplier return form with selected batches
    this.router.navigate(['/admin/purchasing/grn/return'], {
      queryParams: {
        batchIds: selectedIds.join(','),
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/inventory']);
  }

  getExpiryColor(daysUntilExpiry: number): string {
    if (daysUntilExpiry <= 1) return 'red';
    if (daysUntilExpiry <= 3) return 'orange';
    return 'yellow';
  }
}

