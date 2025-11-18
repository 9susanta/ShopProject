import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventoryService } from '../services/inventory.service';
import { SignalRService } from '@core/services/signalr.service';
import { ToastService } from '@core/toast/toast.service';
import { ExpirySoonBatch } from '@core/models/inventory-batch.model';

@Component({
  selector: 'grocery-expiry-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './expiry-management.component.html',
  styleUrl: './expiry-management.component.css',
})
export class ExpiryManagementComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private signalRService = inject(SignalRService);
  private toastService = inject(ToastService);

  batches = signal<ExpirySoonBatch[]>([]);
  loading = signal(false);
  daysAhead = signal(7);
  notificationEnabled = signal(true);

  // Computed signals for counts
  criticalCount = signal(0);
  urgentCount = signal(0);
  warningCount = signal(0);

  displayedColumns: string[] = ['productName', 'batchNumber', 'quantity', 'expiryDate', 'daysUntilExpiry', 'actions'];

  ngOnInit(): void {
    this.loadExpirySoon();
    this.setupNotifications();
  }

  loadExpirySoon(): void {
    this.loading.set(true);
    this.inventoryService.getExpirySoon(this.daysAhead()).subscribe({
      next: (response) => {
        this.batches.set(response.items);
        // Calculate counts
        this.criticalCount.set(response.items.filter(b => b.daysUntilExpiry <= 1).length);
        this.urgentCount.set(response.items.filter(b => b.daysUntilExpiry > 1 && b.daysUntilExpiry <= 3).length);
        this.warningCount.set(response.items.filter(b => b.daysUntilExpiry > 3 && b.daysUntilExpiry <= 7).length);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load expiring batches');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  setupNotifications(): void {
    // Subscribe to expiry alerts
    this.signalRService.expiryAlert$.subscribe((event) => {
      if (this.notificationEnabled()) {
        this.toastService.warning(
          `⚠️ ${event.productName} (Batch ${event.batchNumber}) expires in ${event.daysUntilExpiry} days!`,
          10000 // Show for 10 seconds
        );
      }
      this.loadExpirySoon();
    });
  }

  onDaysAheadChange(): void {
    this.loadExpirySoon();
  }

  getExpiryColor(daysUntilExpiry: number): string {
    if (daysUntilExpiry <= 1) return 'warn';
    if (daysUntilExpiry <= 3) return 'accent';
    return 'primary';
  }
}
