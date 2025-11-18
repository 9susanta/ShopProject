import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { AccountingService, DailyClosingSummary, AccountingLedgerEntry } from '@core/services/accounting.service';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'grocery-daily-closing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    FormsModule,
  ],
  template: `
    <div class="daily-closing-container p-4 max-w-7xl mx-auto">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold">Daily Closing Summary</h1>
        <button mat-raised-button color="primary" (click)="exportSummary()" [disabled]="!summary()">
          <mat-icon>download</mat-icon>
          Export
        </button>
      </div>

      <!-- Date Selector -->
      <mat-card class="mb-4">
        <mat-card-content>
          <div class="flex items-center gap-4">
            <mat-form-field>
              <mat-label>Select Date</mat-label>
              <input matInput [matDatepicker]="picker" [(ngModel)]="selectedDate" (dateChange)="onDateChange()" />
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
            <button mat-button (click)="loadToday()">Today</button>
            <button mat-button (click)="loadYesterday()">Yesterday</button>
          </div>
        </mat-card-content>
      </mat-card>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (summary()) {
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 text-sm mb-1">Total Sales</p>
                  <p class="text-2xl font-bold text-green-600">{{ summary()!.totalSales | currency: 'INR' }}</p>
                </div>
                <mat-icon class="text-green-500 text-4xl">shopping_cart</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 text-sm mb-1">Total Purchases</p>
                  <p class="text-2xl font-bold text-blue-600">{{ summary()!.totalPurchases | currency: 'INR' }}</p>
                </div>
                <mat-icon class="text-blue-500 text-4xl">inventory</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 text-sm mb-1">Net Cash</p>
                  <p class="text-2xl font-bold">{{ summary()!.netCash | currency: 'INR' }}</p>
                </div>
                <mat-icon class="text-4xl">money</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 text-sm mb-1">Net UPI</p>
                  <p class="text-2xl font-bold">{{ summary()!.netUPI | currency: 'INR' }}</p>
                </div>
                <mat-icon class="text-4xl">account_balance_wallet</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 text-sm mb-1">Net Card</p>
                  <p class="text-2xl font-bold">{{ summary()!.netCard | currency: 'INR' }}</p>
                </div>
                <mat-icon class="text-4xl">credit_card</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 text-sm mb-1">Net Pay Later</p>
                  <p class="text-2xl font-bold" [class.text-red-600]="summary()!.netPayLater < 0">
                    {{ summary()!.netPayLater | currency: 'INR' }}
                  </p>
                </div>
                <mat-icon class="text-4xl">schedule</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 text-sm mb-1">GST Collected</p>
                  <p class="text-2xl font-bold text-green-600">{{ summary()!.totalGSTCollected | currency: 'INR' }}</p>
                </div>
                <mat-icon class="text-green-500 text-4xl">receipt</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-500 text-sm mb-1">Total Transactions</p>
                  <p class="text-2xl font-bold">{{ summary()!.totalTransactions }}</p>
                </div>
                <mat-icon class="text-4xl">list_alt</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Additional Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <mat-card>
            <mat-card-content>
              <p class="text-gray-500 text-sm mb-1">Pay Later Payments</p>
              <p class="text-xl font-semibold">{{ summary()!.totalPayLaterPayments | currency: 'INR' }}</p>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <p class="text-gray-500 text-sm mb-1">GST Paid</p>
              <p class="text-xl font-semibold text-blue-600">{{ summary()!.totalGSTPaid | currency: 'INR' }}</p>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <p class="text-gray-500 text-sm mb-1">Total Customers</p>
              <p class="text-xl font-semibold">{{ summary()!.totalCustomers }}</p>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Ledger Entries Table -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Ledger Entries</mat-card-title>
            <mat-card-subtitle>{{ summary()!.entries.length }} entries</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (summary()!.entries.length === 0) {
              <div class="text-center py-8 text-gray-500">No entries found for this date</div>
            } @else {
              <table mat-table [dataSource]="summary()!.entries" class="w-full">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let entry">{{ entry.entryDate | date: 'short' }}</td>
                </ng-container>
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let entry">
                    <mat-chip [color]="getEntryTypeColor(entry.entryType)">
                      {{ entry.entryType }}
                    </mat-chip>
                  </td>
                </ng-container>
                <ng-container matColumnDef="reference">
                  <th mat-header-cell *matHeaderCellDef>Reference</th>
                  <td mat-cell *matCellDef="let entry">{{ entry.reference || 'N/A' }}</td>
                </ng-container>
                <ng-container matColumnDef="customer">
                  <th mat-header-cell *matHeaderCellDef>Customer/Supplier</th>
                  <td mat-cell *matCellDef="let entry">{{ entry.customerName || entry.supplierName || 'N/A' }}</td>
                </ng-container>
                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef>Amount</th>
                  <td mat-cell *matCellDef="let entry" [class.text-green-600]="entry.entryType === 'Sale'" [class.text-red-600]="entry.entryType === 'Purchase'">
                    {{ entry.entryType === 'Sale' ? '+' : '-' }}{{ entry.amount | currency: 'INR' }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="gst">
                  <th mat-header-cell *matHeaderCellDef>GST</th>
                  <td mat-cell *matCellDef="let entry">{{ entry.gstAmount | currency: 'INR' }}</td>
                </ng-container>
                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let entry">{{ entry.description || 'N/A' }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="ledgerColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: ledgerColumns"></tr>
              </table>
            }
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="text-center py-8 text-gray-500">
              <mat-icon class="text-6xl text-gray-400 mb-4">receipt_long</mat-icon>
              <p>No data available for selected date</p>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .daily-closing-container {
      min-height: calc(100vh - 64px);
    }
    .summary-card {
      transition: transform 0.2s;
    }
    .summary-card:hover {
      transform: translateY(-2px);
    }
  `]
})
export class DailyClosingComponent implements OnInit {
  private accountingService = inject(AccountingService);
  private toastService = inject(ToastService);

  summary = signal<DailyClosingSummary | null>(null);
  loading = signal(false);
  selectedDate: Date = new Date();

  ledgerColumns = ['date', 'type', 'reference', 'customer', 'amount', 'gst', 'description'];

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading.set(true);
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    this.accountingService.getDailyClosingSummary(dateStr).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load daily closing summary');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  onDateChange(): void {
    this.loadSummary();
  }

  loadToday(): void {
    this.selectedDate = new Date();
    this.loadSummary();
  }

  loadYesterday(): void {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.selectedDate = yesterday;
    this.loadSummary();
  }

  getEntryTypeColor(type: string): string {
    switch (type) {
      case 'Sale':
        return 'primary';
      case 'Purchase':
        return 'accent';
      case 'PayLaterPayment':
        return 'warn';
      default:
        return '';
    }
  }

  exportSummary(): void {
    if (!this.summary()) return;
    
    // Simple CSV export
    const data = this.summary()!;
    const csv = [
      ['Daily Closing Summary', data.date],
      [],
      ['Total Sales', data.totalSales],
      ['Total Purchases', data.totalPurchases],
      ['Net Cash', data.netCash],
      ['Net UPI', data.netUPI],
      ['Net Card', data.netCard],
      ['Net Pay Later', data.netPayLater],
      ['GST Collected', data.totalGSTCollected],
      ['GST Paid', data.totalGSTPaid],
      ['Total Transactions', data.totalTransactions],
      ['Total Customers', data.totalCustomers],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-closing-${data.date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    this.toastService.success('Summary exported successfully');
  }
}

