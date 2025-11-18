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
import { ReportsService, FastMovingProductsReport } from '@core/services/reports.service';
import { ToastService } from '@core/toast/toast.service';
import { ExportService } from '@core/services/export.service';

@Component({
  selector: 'grocery-fast-moving',
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
    <div class="fast-moving-container p-4 max-w-7xl mx-auto">
      <div class="mb-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">Fast Moving Products</h1>
          <p class="text-gray-600">Top selling products by quantity</p>
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
            <mat-form-field appearance="outline" class="w-32">
              <mat-label>Top N</mat-label>
              <input matInput type="number" [(ngModel)]="topN" min="1" max="100">
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
        <!-- Products Table -->
        @if (report()!.products && report()!.products.length > 0) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>Top {{ topN }} Fast Moving Products</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="report()!.products" class="w-full">
                <ng-container matColumnDef="rank">
                  <th mat-header-cell *matHeaderCellDef>Rank</th>
                  <td mat-cell *matCellDef="let product; let i = index">
                    <div class="flex items-center gap-2">
                      @if (i < 3) {
                        <mat-icon class="text-yellow-500">star</mat-icon>
                      }
                      <span class="font-bold">#{{ i + 1 }}</span>
                    </div>
                  </td>
                </ng-container>
                <ng-container matColumnDef="productName">
                  <th mat-header-cell *matHeaderCellDef>Product</th>
                  <td mat-cell *matCellDef="let product">
                    <div>
                      <div class="font-semibold">{{ product.productName }}</div>
                      <div class="text-sm text-gray-500">{{ product.sku }}</div>
                    </div>
                  </td>
                </ng-container>
                <ng-container matColumnDef="totalQuantitySold">
                  <th mat-header-cell *matHeaderCellDef>Quantity Sold</th>
                  <td mat-cell *matCellDef="let product">{{ product.totalQuantitySold || product.quantitySold }}</td>
                </ng-container>
                <ng-container matColumnDef="totalRevenue">
                  <th mat-header-cell *matHeaderCellDef>Total Revenue</th>
                  <td mat-cell *matCellDef="let product">{{ product.totalRevenue || product.revenue | currency: 'INR' }}</td>
                </ng-container>
                <ng-container matColumnDef="numberOfSales">
                  <th mat-header-cell *matHeaderCellDef>Sales Count</th>
                  <td mat-cell *matCellDef="let product">{{ product.numberOfSales }}</td>
                </ng-container>
                <ng-container matColumnDef="averageSalePrice">
                  <th mat-header-cell *matHeaderCellDef>Avg. Sale Price</th>
                  <td mat-cell *matCellDef="let product">{{ product.averageSalePrice | currency: 'INR' }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['rank', 'productName', 'totalQuantitySold', 'totalRevenue', 'numberOfSales', 'averageSalePrice']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['rank', 'productName', 'totalQuantitySold', 'totalRevenue', 'numberOfSales', 'averageSalePrice']"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        } @else {
          <mat-card>
            <mat-card-content>
              <div class="text-center py-8 text-gray-500">No products found for this period</div>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .fast-moving-container {
      min-height: calc(100vh - 64px);
    }
  `]
})
export class FastMovingComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private toastService = inject(ToastService);
  private exportService = inject(ExportService);

  loading = signal(false);
  report = signal<FastMovingProductsReport | null>(null);
  startDate: Date = new Date(new Date().setDate(new Date().getDate() - 30));
  endDate: Date = new Date();
  topN = 20;

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);
    const startDateStr = this.startDate.toISOString().split('T')[0];
    const endDateStr = this.endDate.toISOString().split('T')[0];
    this.reportsService.getFastMovingProducts(startDateStr, endDateStr, this.topN).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading fast moving products report:', error);
        this.toastService.error('Failed to load fast moving products report');
        this.loading.set(false);
      },
    });
  }

  exportToPDF(): void {
    if (!this.report() || !this.report()!.products || this.report()!.products.length === 0) {
      this.toastService.error('No report data to export');
      return;
    }

    const report = this.report()!;
    const data = report.products.map((product, index) => ({
      'Rank': index + 1,
      'Product': product.productName,
      'SKU': product.sku,
      'Quantity Sold': product.totalQuantitySold || product.quantitySold,
      'Total Revenue': product.totalRevenue || product.revenue,
      'Sales Count': product.numberOfSales,
      'Average Sale Price': product.averageSalePrice,
    }));

    this.exportService.exportToPDF(
      `Fast Moving Products Report - Top ${this.topN}`,
      data,
      `fast-moving-${this.startDate.toISOString().split('T')[0]}-${this.endDate.toISOString().split('T')[0]}`
    );
    this.toastService.success('PDF export initiated');
  }

  exportToExcel(): void {
    if (!this.report() || !this.report()!.products || this.report()!.products.length === 0) {
      this.toastService.error('No report data to export');
      return;
    }

    const report = this.report()!;
    const data = report.products.map((product, index) => ({
      'Rank': index + 1,
      'Product': product.productName,
      'SKU': product.sku,
      'Quantity Sold': product.totalQuantitySold || product.quantitySold,
      'Total Revenue': product.totalRevenue || product.revenue,
      'Sales Count': product.numberOfSales,
      'Average Sale Price': product.averageSalePrice,
    }));

    this.exportService.exportToExcel(
      data,
      `fast-moving-${this.startDate.toISOString().split('T')[0]}-${this.endDate.toISOString().split('T')[0]}`,
      'Fast Moving Products'
    );
    this.toastService.success('Excel file exported successfully');
  }
}
