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
import { ReportsService, DailySalesReport } from '@core/services/reports.service';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'grocery-daily-sales',
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
    <div class="daily-sales-container p-4 max-w-7xl mx-auto">
      <div class="mb-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">Daily Sales Report</h1>
          <p class="text-gray-600">View sales summary for a specific date</p>
        </div>
        <button mat-button routerLink="/admin/reports">
          <mat-icon>arrow_back</mat-icon>
          Back to Reports
        </button>
      </div>

      <!-- Date Filter -->
      <mat-card class="mb-4">
        <mat-card-content>
          <div class="flex gap-4 items-end">
            <mat-form-field appearance="outline">
              <mat-label>Select Date</mat-label>
              <input matInput [matDatepicker]="picker" [(ngModel)]="selectedDate" (dateChange)="loadReport()">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600">Total Sales</div>
                  <div class="text-2xl font-bold">{{ report()!.totalSales }}</div>
                </div>
                <mat-icon class="text-blue-500">receipt</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600">Total Revenue</div>
                  <div class="text-2xl font-bold">{{ report()!.totalRevenue | currency: 'INR' }}</div>
                </div>
                <mat-icon class="text-green-500">attach_money</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600">Total Tax</div>
                  <div class="text-2xl font-bold">{{ report()!.totalTax | currency: 'INR' }}</div>
                </div>
                <mat-icon class="text-orange-500">account_balance</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600">Total Customers</div>
                  <div class="text-2xl font-bold">{{ report()!.totalCustomers }}</div>
                </div>
                <mat-icon class="text-purple-500">people</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Payment Method Breakdown -->
        <mat-card class="mb-4">
          <mat-card-header>
            <mat-card-title>Payment Method Breakdown</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="payment-method">
                <div class="text-sm text-gray-600">Cash</div>
                <div class="text-xl font-semibold">{{ report()!.totalCash | currency: 'INR' }}</div>
              </div>
              <div class="payment-method">
                <div class="text-sm text-gray-600">UPI</div>
                <div class="text-xl font-semibold">{{ report()!.totalUPI | currency: 'INR' }}</div>
              </div>
              <div class="payment-method">
                <div class="text-sm text-gray-600">Card</div>
                <div class="text-xl font-semibold">{{ report()!.totalCard | currency: 'INR' }}</div>
              </div>
              <div class="payment-method">
                <div class="text-sm text-gray-600">Pay Later</div>
                <div class="text-xl font-semibold">{{ report()!.totalPayLater | currency: 'INR' }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Sales List -->
        @if (report()!.sales && report()!.sales.length > 0) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>Sales Details</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="report()!.sales" class="w-full">
                <ng-container matColumnDef="invoiceNumber">
                  <th mat-header-cell *matHeaderCellDef>Invoice</th>
                  <td mat-cell *matCellDef="let sale">{{ sale.invoiceNumber }}</td>
                </ng-container>
                <ng-container matColumnDef="customerName">
                  <th mat-header-cell *matHeaderCellDef>Customer</th>
                  <td mat-cell *matCellDef="let sale">{{ sale.customerName || 'Guest' }}</td>
                </ng-container>
                <ng-container matColumnDef="saleDate">
                  <th mat-header-cell *matHeaderCellDef>Time</th>
                  <td mat-cell *matCellDef="let sale">{{ sale.saleDate | date: 'short' }}</td>
                </ng-container>
                <ng-container matColumnDef="totalAmount">
                  <th mat-header-cell *matHeaderCellDef>Amount</th>
                  <td mat-cell *matCellDef="let sale">{{ sale.totalAmount | currency: 'INR' }}</td>
                </ng-container>
                <ng-container matColumnDef="paymentMethod">
                  <th mat-header-cell *matHeaderCellDef>Payment</th>
                  <td mat-cell *matCellDef="let sale">{{ sale.paymentMethod }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['invoiceNumber', 'customerName', 'saleDate', 'totalAmount', 'paymentMethod']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['invoiceNumber', 'customerName', 'saleDate', 'totalAmount', 'paymentMethod']"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        } @else {
          <mat-card>
            <mat-card-content>
              <div class="text-center py-8 text-gray-500">No sales found for this date</div>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .daily-sales-container {
      min-height: calc(100vh - 64px);
    }
    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .payment-method {
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }
  `]
})
export class DailySalesComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private toastService = inject(ToastService);

  loading = signal(false);
  report = signal<DailySalesReport | null>(null);
  selectedDate: Date = new Date();

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    this.reportsService.getDailySalesReport(dateStr).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading daily sales report:', error);
        this.toastService.error('Failed to load daily sales report');
        this.loading.set(false);
      },
    });
  }
}
