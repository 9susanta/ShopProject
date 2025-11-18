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
import { ReportsService, GSTSummaryReport } from '@core/services/reports.service';
import { ToastService } from '@core/toast/toast.service';
import { ExportService } from '@core/services/export.service';

@Component({
  selector: 'grocery-gst-summary',
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
    <div class="gst-summary-container p-4 max-w-7xl mx-auto">
      <div class="mb-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">GST Summary Report</h1>
          <p class="text-gray-600">View GST breakdown by tax slabs</p>
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600">Total Sales</div>
                  <div class="text-2xl font-bold">{{ report()!.totalSales | currency: 'INR' }}</div>
                </div>
                <mat-icon class="text-blue-500">receipt</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600">Total GST</div>
                  <div class="text-2xl font-bold">{{ report()!.totalGST | currency: 'INR' }}</div>
                </div>
                <mat-icon class="text-green-500">account_balance</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600">Total CGST</div>
                  <div class="text-2xl font-bold">{{ report()!.totalCGST | currency: 'INR' }}</div>
                </div>
                <mat-icon class="text-orange-500">account_balance_wallet</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600">Total SGST</div>
                  <div class="text-2xl font-bold">{{ report()!.totalSGST | currency: 'INR' }}</div>
                </div>
                <mat-icon class="text-purple-500">account_balance_wallet</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- GST Slab Breakdown -->
        @if (report()!.slabSummaries && report()!.slabSummaries.length > 0) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>GST Breakdown by Tax Slab</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="report()!.slabSummaries" class="w-full">
                <ng-container matColumnDef="rate">
                  <th mat-header-cell *matHeaderCellDef>GST Rate</th>
                  <td mat-cell *matCellDef="let slab">{{ slab.rate }}%</td>
                </ng-container>
                <ng-container matColumnDef="taxableAmount">
                  <th mat-header-cell *matHeaderCellDef>Taxable Amount</th>
                  <td mat-cell *matCellDef="let slab">{{ slab.taxableAmount | currency: 'INR' }}</td>
                </ng-container>
                <ng-container matColumnDef="cgstAmount">
                  <th mat-header-cell *matHeaderCellDef>CGST</th>
                  <td mat-cell *matCellDef="let slab">{{ slab.cgstAmount | currency: 'INR' }}</td>
                </ng-container>
                <ng-container matColumnDef="sgstAmount">
                  <th mat-header-cell *matHeaderCellDef>SGST</th>
                  <td mat-cell *matCellDef="let slab">{{ slab.sgstAmount | currency: 'INR' }}</td>
                </ng-container>
                <ng-container matColumnDef="totalGSTAmount">
                  <th mat-header-cell *matHeaderCellDef>Total GST</th>
                  <td mat-cell *matCellDef="let slab">{{ slab.totalGSTAmount | currency: 'INR' }}</td>
                </ng-container>
                <ng-container matColumnDef="transactionCount">
                  <th mat-header-cell *matHeaderCellDef>Transactions</th>
                  <td mat-cell *matCellDef="let slab">{{ slab.transactionCount }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['rate', 'taxableAmount', 'cgstAmount', 'sgstAmount', 'totalGSTAmount', 'transactionCount']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['rate', 'taxableAmount', 'cgstAmount', 'sgstAmount', 'totalGSTAmount', 'transactionCount']"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        } @else {
          <mat-card>
            <mat-card-content>
              <div class="text-center py-8 text-gray-500">No GST data found for this period</div>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .gst-summary-container {
      min-height: calc(100vh - 64px);
    }
    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
  `]
})
export class GstSummaryComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private toastService = inject(ToastService);
  private exportService = inject(ExportService);

  loading = signal(false);
  report = signal<GSTSummaryReport | null>(null);
  startDate: Date = new Date(new Date().setDate(new Date().getDate() - 30));
  endDate: Date = new Date();

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);
    const startDateStr = this.startDate.toISOString().split('T')[0];
    const endDateStr = this.endDate.toISOString().split('T')[0];
    this.reportsService.getGSTSummaryReport(startDateStr, endDateStr).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading GST summary report:', error);
        this.toastService.error('Failed to load GST summary report');
        this.loading.set(false);
      },
    });
  }

  exportToPDF(): void {
    if (!this.report()) {
      this.toastService.error('No report data to export');
      return;
    }

    const report = this.report()!;
    const items = report.slabSummaries || [];
    const data = items.map((item: any) => ({
      'GST Rate': `${item.rate}%`,
      'Taxable Amount': item.taxableAmount,
      'CGST Amount': item.cgstAmount,
      'SGST Amount': item.sgstAmount,
      'Total GST': item.totalGSTAmount,
      'Transaction Count': item.transactionCount,
    }));

    this.exportService.exportToPDF(
      `GST Summary Report - ${this.startDate.toLocaleDateString()} to ${this.endDate.toLocaleDateString()}`,
      data,
      `gst-summary-${this.startDate.toISOString().split('T')[0]}-${this.endDate.toISOString().split('T')[0]}`
    );
    this.toastService.success('PDF export initiated');
  }

  exportToExcel(): void {
    if (!this.report()) {
      this.toastService.error('No report data to export');
      return;
    }

    const report = this.report()!;
    const items = report.slabSummaries || [];
    const data = items.map((item: any) => ({
      'GST Rate': `${item.rate}%`,
      'Taxable Amount': item.taxableAmount,
      'CGST Amount': item.cgstAmount,
      'SGST Amount': item.sgstAmount,
      'Total GST': item.totalGSTAmount,
      'Transaction Count': item.transactionCount,
    }));

    this.exportService.exportToExcel(
      data,
      `gst-summary-${this.startDate.toISOString().split('T')[0]}-${this.endDate.toISOString().split('T')[0]}`,
      'GST Summary'
    );
    this.toastService.success('Excel file exported successfully');
  }
}
