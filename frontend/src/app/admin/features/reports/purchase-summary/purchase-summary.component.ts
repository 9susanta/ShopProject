import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReportsService } from '@core/services/reports.service';
import { ToastService } from '@core/toast/toast.service';
import { ExportService } from '@core/services/export.service';

interface PurchaseSummaryReport {
  startDate: string;
  endDate: string;
  totalPurchaseOrders: number;
  totalGRNs: number;
  totalPurchaseAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
  totalItemsPurchased: number;
  purchases: PurchaseSummaryItem[];
}

interface PurchaseSummaryItem {
  date: string;
  purchaseOrderNumber: string;
  supplierName: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
}

@Component({
  selector: 'grocery-purchase-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DatePipe,
  ],
  template: `
    <div class="admin-page-container">
      <div class="admin-page-header">
        <div>
          <h1>Purchase Summary Report</h1>
          <p class="text-gray-600">View purchase summary for a date range</p>
        </div>
        <div class="flex gap-2">
          <button mat-raised-button color="primary" (click)="exportToPDF()" [disabled]="!report() || loading()">
            <mat-icon>picture_as_pdf</mat-icon>
            Export PDF
          </button>
          <button mat-raised-button color="accent" (click)="exportToExcel()" [disabled]="!report() || loading()">
            <mat-icon>table_chart</mat-icon>
            Export Excel
          </button>
          <button mat-button routerLink="/admin/reports">
            <mat-icon>arrow_back</mat-icon>
            Back to Reports
          </button>
        </div>
      </div>

      <!-- Date Range Filter -->
      <mat-card class="mb-4">
        <mat-card-content>
          <div class="flex gap-4 items-end">
            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="loadReport()" [disabled]="loading()">
              <mat-icon>refresh</mat-icon>
              Load Report
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (report()) {
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600">Total Purchase Orders</div>
                  <div class="text-2xl font-bold">{{ report()!.totalPurchaseOrders }}</div>
                </div>
                <mat-icon class="text-blue-500">receipt_long</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600">Total GRNs</div>
                  <div class="text-2xl font-bold">{{ report()!.totalGRNs }}</div>
                </div>
                <mat-icon class="text-green-500">inventory</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600">Total Purchase Amount</div>
                  <div class="text-2xl font-bold">₹{{ report()!.totalPurchaseAmount | number:'1.2-2' }}</div>
                </div>
                <mat-icon class="text-purple-500">shopping_bag</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600">Total Paid</div>
                  <div class="text-2xl font-bold text-green-600">₹{{ report()!.totalPaidAmount | number:'1.2-2' }}</div>
                </div>
                <mat-icon class="text-green-500">payment</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600">Total Pending</div>
                  <div class="text-2xl font-bold text-orange-600">₹{{ report()!.totalPendingAmount | number:'1.2-2' }}</div>
                </div>
                <mat-icon class="text-orange-500">pending</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600">Total Items</div>
                  <div class="text-2xl font-bold">{{ report()!.totalItemsPurchased }}</div>
                </div>
                <mat-icon class="text-blue-500">inventory_2</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Purchase Details Table -->
        <mat-card>
          <mat-card-content>
            <h2 class="text-lg font-semibold mb-4">Purchase Details</h2>
            @if (report()!.purchases.length === 0) {
              <div class="text-center py-8 text-gray-500">No purchases found for the selected date range</div>
            } @else {
              <table mat-table [dataSource]="report()!.purchases" class="w-full">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let purchase">{{ purchase.date | date:'short' }}</td>
                </ng-container>
                <ng-container matColumnDef="purchaseOrderNumber">
                  <th mat-header-cell *matHeaderCellDef>PO Number</th>
                  <td mat-cell *matCellDef="let purchase">{{ purchase.purchaseOrderNumber }}</td>
                </ng-container>
                <ng-container matColumnDef="supplierName">
                  <th mat-header-cell *matHeaderCellDef>Supplier</th>
                  <td mat-cell *matCellDef="let purchase">{{ purchase.supplierName }}</td>
                </ng-container>
                <ng-container matColumnDef="totalAmount">
                  <th mat-header-cell *matHeaderCellDef>Total Amount</th>
                  <td mat-cell *matCellDef="let purchase">₹{{ purchase.totalAmount | number:'1.2-2' }}</td>
                </ng-container>
                <ng-container matColumnDef="paidAmount">
                  <th mat-header-cell *matHeaderCellDef>Paid</th>
                  <td mat-cell *matCellDef="let purchase">₹{{ purchase.paidAmount | number:'1.2-2' }}</td>
                </ng-container>
                <ng-container matColumnDef="pendingAmount">
                  <th mat-header-cell *matHeaderCellDef>Pending</th>
                  <td mat-cell *matCellDef="let purchase">₹{{ purchase.pendingAmount | number:'1.2-2' }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let purchase">
                    <span [class]="getStatusClass(purchase.status)">{{ purchase.status }}</span>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['date', 'purchaseOrderNumber', 'supplierName', 'totalAmount', 'paidAmount', 'pendingAmount', 'status']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['date', 'purchaseOrderNumber', 'supplierName', 'totalAmount', 'paidAmount', 'pendingAmount', 'status']"></tr>
              </table>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .admin-page-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .admin-page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .admin-page-header h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }
    .summary-card {
      min-height: 120px;
    }
  `]
})
export class PurchaseSummaryComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private toastService = inject(ToastService);
  private exportService = inject(ExportService);

  report = signal<PurchaseSummaryReport | null>(null);
  loading = signal(false);
  startDate: Date | null = new Date(new Date().setDate(new Date().getDate() - 30));
  endDate: Date | null = new Date();

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    if (!this.startDate || !this.endDate) {
      this.toastService.warning('Please select both start and end dates');
      return;
    }

    this.loading.set(true);
    const startDateStr = this.startDate.toISOString().split('T')[0];
    const endDateStr = this.endDate.toISOString().split('T')[0];

    // For now, create a mock report structure until backend endpoint is ready
    // This will be replaced with actual API call
    this.reportsService.getPurchaseSummaryReport(startDateStr, endDateStr).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        // If endpoint doesn't exist yet, show mock data
        if (error.status === 404) {
          this.report.set({
            startDate: startDateStr,
            endDate: endDateStr,
            totalPurchaseOrders: 0,
            totalGRNs: 0,
            totalPurchaseAmount: 0,
            totalPaidAmount: 0,
            totalPendingAmount: 0,
            totalItemsPurchased: 0,
            purchases: [],
          });
          this.toastService.info('Purchase summary endpoint not yet implemented. Showing empty report.');
        } else {
          this.toastService.error('Failed to load purchase summary');
        }
        this.loading.set(false);
      },
    });
  }

  exportToPDF(): void {
    if (!this.report()) return;
    const data = this.report()!.purchases.map(p => ({
      Date: p.date,
      'PO Number': p.purchaseOrderNumber,
      Supplier: p.supplierName,
      'Total Amount': p.totalAmount,
      'Paid Amount': p.paidAmount,
      'Pending Amount': p.pendingAmount,
      Status: p.status,
    }));
    this.exportService.exportToPDF('Purchase Summary Report', data, 'purchase-summary');
  }

  exportToExcel(): void {
    if (!this.report()) return;
    const data = this.report()!.purchases.map(p => ({
      Date: p.date,
      'PO Number': p.purchaseOrderNumber,
      Supplier: p.supplierName,
      'Total Amount': p.totalAmount,
      'Paid Amount': p.paidAmount,
      'Pending Amount': p.pendingAmount,
      Status: p.status,
    }));
    this.exportService.exportToExcel(data, 'purchase-summary');
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'Completed': 'text-green-600 font-semibold',
      'Pending': 'text-orange-600 font-semibold',
      'Cancelled': 'text-red-600 font-semibold',
    };
    return statusMap[status] || '';
  }
}

