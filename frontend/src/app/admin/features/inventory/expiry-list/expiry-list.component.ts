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
import { InventoryService } from '../services/inventory.service';
import { ToastService } from '@core/toast/toast.service';
import { ExpirySoonBatch } from '@core/models/inventory-batch.model';

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
  ],
  templateUrl: './expiry-list.component.html',
  styleUrl: './expiry-list.component.css',
})
export class ExpiryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  batches = signal<ExpirySoonBatch[]>([]);
  loading = signal(false);
  daysAhead = signal(7);
  selectedBatches = signal<Set<string>>(new Set());

  displayedColumns: string[] = ['select', 'productName', 'batchNumber', 'quantity', 'expiryDate', 'daysUntilExpiry', 'actions'];

  ngOnInit(): void {
    this.loadExpirySoon();
  }

  loadExpirySoon(): void {
    this.loading.set(true);
    this.inventoryService.getExpirySoon(this.daysAhead()).subscribe({
      next: (response) => {
        this.batches.set(response.items);
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

    // TODO: Implement mark expired API call
    this.toastService.info(`Marking ${selectedIds.length} batch(es) as expired...`);
    // After API call, refresh the list
    this.loadExpirySoon();
    this.selectedBatches.set(new Set());
  }

  createReturn(): void {
    const selectedIds = Array.from(this.selectedBatches());
    if (selectedIds.length === 0) {
      this.toastService.warning('Please select batches to return');
      return;
    }

    // Navigate to supplier return form with selected batches
    this.router.navigate(['/purchasing/grn/return'], {
      queryParams: {
        batchIds: selectedIds.join(','),
      },
    });
  }

  getExpiryColor(daysUntilExpiry: number): string {
    if (daysUntilExpiry <= 1) return 'red';
    if (daysUntilExpiry <= 3) return 'orange';
    return 'yellow';
  }
}

