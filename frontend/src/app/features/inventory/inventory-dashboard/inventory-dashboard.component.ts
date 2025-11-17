import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryService } from '../inventory.service';
import { StockValuation, LowStockProduct, ExpirySoonBatch } from '@core/models/inventory-batch.model';
import { SignalRService } from '@core/services/signalr.service';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'grocery-inventory-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './inventory-dashboard.component.html',
  styleUrl: './inventory-dashboard.component.css',
})
export class InventoryDashboardComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private signalRService = inject(SignalRService);
  private toastService = inject(ToastService);

  loading = signal(false);
  valuation = signal<StockValuation | null>(null);
  lowStockCount = signal(0);
  expirySoonCount = signal(0);

  // Computed values for display
  totalSKUs = computed(() => this.valuation()?.totalSKUs || 0);
  totalStockValue = computed(() => this.valuation()?.totalStockValue || 0);
  totalQuantity = computed(() => this.valuation()?.totalQuantity || 0);

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupSignalRSubscriptions();
  }

  loadDashboardData(): void {
    this.loading.set(true);

    // Load valuation
    this.inventoryService.getValuation('FIFO').subscribe({
      next: (val) => {
        this.valuation.set(val);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading valuation:', error);
        this.loading.set(false);
      },
    });

    // Load low stock count
    this.inventoryService.getLowStock().subscribe({
      next: (response) => {
        this.lowStockCount.set(response.totalCount);
      },
      error: (error) => {
        console.error('Error loading low stock:', error);
      },
    });

    // Load expiry soon count
    this.inventoryService.getExpirySoon(7).subscribe({
      next: (response) => {
        this.expirySoonCount.set(response.totalCount);
      },
      error: (error) => {
        console.error('Error loading expiry soon:', error);
      },
    });
  }

  setupSignalRSubscriptions(): void {
    // Subscribe to low stock alerts
    this.signalRService.lowStockAlert$.subscribe((event) => {
      this.toastService.warning(`${event.productName} is low on stock! Current: ${event.currentStock}, Threshold: ${event.threshold}`);
      // Refresh low stock count
      this.inventoryService.getLowStock().subscribe({
        next: (response) => this.lowStockCount.set(response.totalCount),
      });
    });

    // Subscribe to expiry alerts
    this.signalRService.expiryAlert$.subscribe((event) => {
      this.toastService.warning(`${event.productName} (Batch ${event.batchNumber}) expires in ${event.daysUntilExpiry} days!`);
      // Refresh expiry count
      this.inventoryService.getExpirySoon(7).subscribe({
        next: (response) => this.expirySoonCount.set(response.totalCount),
      });
    });
  }

  refresh(): void {
    this.loadDashboardData();
  }
}

