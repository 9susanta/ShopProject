import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportsService } from '@core/services/reports.service';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'grocery-low-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="low-stock-container p-4 max-w-7xl mx-auto">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Low Stock Report</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="mb-4">
            <mat-form-field>
              <mat-label>Threshold</mat-label>
              <input matInput type="number" [(ngModel)]="threshold" placeholder="Default: 10">
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="loadReport()" [disabled]="loading()" class="ml-4">
              Generate Report
            </button>
          </div>

          @if (loading()) {
            <div class="flex justify-center p-8">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (report()?.items) {
            <table mat-table [dataSource]="report()!.items" class="w-full">
              <ng-container matColumnDef="productName">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let item">{{ item.productName }}</td>
              </ng-container>
              <ng-container matColumnDef="currentStock">
                <th mat-header-cell *matHeaderCellDef>Current Stock</th>
                <td mat-cell *matCellDef="let item">{{ item.currentStock }}</td>
              </ng-container>
              <ng-container matColumnDef="lowStockThreshold">
                <th mat-header-cell *matHeaderCellDef>Threshold</th>
                <td mat-cell *matCellDef="let item">{{ item.lowStockThreshold }}</td>
              </ng-container>
              <ng-container matColumnDef="reorderPoint">
                <th mat-header-cell *matHeaderCellDef>Reorder Point</th>
                <td mat-cell *matCellDef="let item">{{ item.reorderPoint }}</td>
              </ng-container>
              <ng-container matColumnDef="suggestedReorderQuantity">
                <th mat-header-cell *matHeaderCellDef>Suggested Qty</th>
                <td mat-cell *matCellDef="let item">{{ item.suggestedReorderQuantity }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['productName', 'currentStock', 'lowStockThreshold', 'reorderPoint', 'suggestedReorderQuantity']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['productName', 'currentStock', 'lowStockThreshold', 'reorderPoint', 'suggestedReorderQuantity']"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.low-stock-container { min-height: calc(100vh - 64px); }`]
})
export class LowStockComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private toastService = inject(ToastService);

  report = signal<any>(null);
  loading = signal(false);
  threshold?: number;

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);
    this.reportsService.getLowStockReport(this.threshold).subscribe({
      next: (response) => {
        this.report.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading low stock report:', error);
        this.toastService.error('Failed to load report');
        this.loading.set(false);
      },
    });
  }
}

