import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportsService } from '@core/services/reports.service';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'grocery-slow-moving',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="slow-moving-container p-4 max-w-7xl mx-auto">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Slow-Moving Products Report</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filterForm" class="mb-4">
            <div class="grid grid-cols-4 gap-4">
              <mat-form-field>
                <mat-label>From Date</mat-label>
                <input matInput [matDatepicker]="fromPicker" formControlName="fromDate">
                <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
                <mat-datepicker #fromPicker></mat-datepicker>
              </mat-form-field>
              <mat-form-field>
                <mat-label>To Date</mat-label>
                <input matInput [matDatepicker]="toPicker" formControlName="toDate">
                <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
                <mat-datepicker #toPicker></mat-datepicker>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Days Threshold</mat-label>
                <input matInput type="number" formControlName="daysThreshold">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Min Days Since Last Sale</mat-label>
                <input matInput type="number" formControlName="minDaysSinceLastSale">
              </mat-form-field>
            </div>
            <button mat-raised-button color="primary" (click)="loadReport()" [disabled]="loading()">
              Generate Report
            </button>
          </form>

          @if (loading()) {
            <div class="flex justify-center p-8">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (report()) {
            <table mat-table [dataSource]="report()!.products" class="w-full">
              <ng-container matColumnDef="productName">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let item">{{ item.productName }}</td>
              </ng-container>
              <ng-container matColumnDef="currentStock">
                <th mat-header-cell *matHeaderCellDef>Stock</th>
                <td mat-cell *matCellDef="let item">{{ item.currentStock }}</td>
              </ng-container>
              <ng-container matColumnDef="totalSalesQuantity">
                <th mat-header-cell *matHeaderCellDef>Qty Sold</th>
                <td mat-cell *matCellDef="let item">{{ item.totalSalesQuantity }}</td>
              </ng-container>
              <ng-container matColumnDef="totalSalesAmount">
                <th mat-header-cell *matHeaderCellDef>Sales Amount</th>
                <td mat-cell *matCellDef="let item">₹{{ item.totalSalesAmount | number: '1.2-2' }}</td>
              </ng-container>
              <ng-container matColumnDef="lastSaleDate">
                <th mat-header-cell *matHeaderCellDef>Last Sale</th>
                <td mat-cell *matCellDef="let item">
                  {{ item.lastSaleDate ? (item.lastSaleDate | date: 'short') : 'Never' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="daysSinceLastSale">
                <th mat-header-cell *matHeaderCellDef>Days Since Last Sale</th>
                <td mat-cell *matCellDef="let item">{{ item.daysSinceLastSale }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['productName', 'currentStock', 'totalSalesQuantity', 'totalSalesAmount', 'lastSaleDate', 'daysSinceLastSale']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['productName', 'currentStock', 'totalSalesQuantity', 'totalSalesAmount', 'lastSaleDate', 'daysSinceLastSale']"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.slow-moving-container { min-height: calc(100vh - 64px); }`]
})
export class SlowMovingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportsService = inject(ReportsService);
  private toastService = inject(ToastService);

  filterForm!: FormGroup;
  report = signal<any>(null);
  loading = signal(false);

  ngOnInit(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
    
    this.filterForm = this.fb.group({
      fromDate: [thirtyDaysAgo, Validators.required],
      toDate: [today, Validators.required],
      daysThreshold: [90, Validators.required],
      minDaysSinceLastSale: [30, Validators.required],
    });
  }

  loadReport(): void {
    if (this.filterForm.invalid) return;

    this.loading.set(true);
    const { fromDate, toDate, daysThreshold, minDaysSinceLastSale } = this.filterForm.value;

    this.reportsService.getSlowMovingProducts(
      fromDate.toISOString(),
      toDate.toISOString(),
      daysThreshold,
      minDaysSinceLastSale
    ).subscribe({
      next: (response) => {
        this.report.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading slow-moving report:', error);
        this.toastService.error('Failed to load report');
        this.loading.set(false);
      },
    });
  }
}

