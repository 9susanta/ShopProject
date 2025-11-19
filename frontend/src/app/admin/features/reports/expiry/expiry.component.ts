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
import { MatChipsModule } from '@angular/material/chips';
import { ReportsService } from '@core/services/reports.service';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'grocery-expiry',
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
    MatChipsModule,
  ],
  template: `
    <div class="expiry-container p-4 max-w-7xl mx-auto">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Expiry Report</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="mb-4">
            <mat-form-field>
              <mat-label>Days Threshold</mat-label>
              <input matInput type="number" [(ngModel)]="daysThreshold" placeholder="Default: 30">
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
              <ng-container matColumnDef="batchNumber">
                <th mat-header-cell *matHeaderCellDef>Batch</th>
                <td mat-cell *matCellDef="let item">{{ item.batchNumber }}</td>
              </ng-container>
              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef>Quantity</th>
                <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
              </ng-container>
              <ng-container matColumnDef="expiryDate">
                <th mat-header-cell *matHeaderCellDef>Expiry Date</th>
                <td mat-cell *matCellDef="let item">{{ item.expiryDate | date: 'short' }}</td>
              </ng-container>
              <ng-container matColumnDef="daysUntilExpiry">
                <th mat-header-cell *matHeaderCellDef>Days Until Expiry</th>
                <td mat-cell *matCellDef="let item">
                  <mat-chip [color]="item.isExpired ? 'warn' : item.daysUntilExpiry <= 7 ? 'accent' : 'primary'">
                    {{ item.isExpired ? 'Expired' : item.daysUntilExpiry }}
                  </mat-chip>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['productName', 'batchNumber', 'quantity', 'expiryDate', 'daysUntilExpiry']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['productName', 'batchNumber', 'quantity', 'expiryDate', 'daysUntilExpiry']"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.expiry-container { min-height: calc(100vh - 64px); }`]
})
export class ExpiryComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private toastService = inject(ToastService);

  report = signal<any>(null);
  loading = signal(false);
  daysThreshold = 30;

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);
    this.reportsService.getExpiryReport(this.daysThreshold).subscribe({
      next: (response) => {
        // Ensure report has items array, default to empty array if undefined
        if (response && !response.items) {
          response.items = [];
        }
        this.report.set(response || { items: [] });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading expiry report:', error);
        this.toastService.error('Failed to load report');
        this.report.set({ items: [] });
        this.loading.set(false);
      },
    });
  }
}

