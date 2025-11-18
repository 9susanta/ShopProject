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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportsService } from '@core/services/reports.service';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'grocery-item-wise-sales',
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
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="item-wise-sales-container p-4 max-w-7xl mx-auto">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Item-wise Sales Report</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filterForm" class="mb-4">
            <div class="grid grid-cols-2 gap-4">
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
            </div>
            <button mat-raised-button color="primary" (click)="loadReport()" [disabled]="loading()">
              Generate Report
            </button>
          </form>

          @if (loading()) {
            <div class="flex justify-center p-8">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (report()?.items) {
            <div class="mb-4">
              <p><strong>Total Sales:</strong> ₹{{ report()!.totalSalesAmount | number: '1.2-2' }}</p>
              <p><strong>Total Quantity Sold:</strong> {{ report()!.totalQuantitySold }}</p>
            </div>
            <table mat-table [dataSource]="report()!.items" class="w-full">
              <ng-container matColumnDef="productName">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let item">{{ item.productName }}</td>
              </ng-container>
              <ng-container matColumnDef="quantitySold">
                <th mat-header-cell *matHeaderCellDef>Qty Sold</th>
                <td mat-cell *matCellDef="let item">{{ item.quantitySold }}</td>
              </ng-container>
              <ng-container matColumnDef="totalAmount">
                <th mat-header-cell *matHeaderCellDef>Total Amount</th>
                <td mat-cell *matCellDef="let item">₹{{ item.totalAmount | number: '1.2-2' }}</td>
              </ng-container>
              <ng-container matColumnDef="averagePrice">
                <th mat-header-cell *matHeaderCellDef>Avg Price</th>
                <td mat-cell *matCellDef="let item">₹{{ item.averagePrice | number: '1.2-2' }}</td>
              </ng-container>
              <ng-container matColumnDef="numberOfTransactions">
                <th mat-header-cell *matHeaderCellDef>Transactions</th>
                <td mat-cell *matCellDef="let item">{{ item.numberOfTransactions }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['productName', 'quantitySold', 'totalAmount', 'averagePrice', 'numberOfTransactions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['productName', 'quantitySold', 'totalAmount', 'averagePrice', 'numberOfTransactions']"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.item-wise-sales-container { min-height: calc(100vh - 64px); }`]
})
export class ItemWiseSalesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportsService = inject(ReportsService);
  private toastService = inject(ToastService);

  filterForm!: FormGroup;
  report = signal<any>(null);
  loading = signal(false);

  ngOnInit(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.filterForm = this.fb.group({
      fromDate: [firstDayOfMonth, Validators.required],
      toDate: [today, Validators.required],
    });
  }

  loadReport(): void {
    if (this.filterForm.invalid) return;

    this.loading.set(true);
    const { fromDate, toDate } = this.filterForm.value;

    this.reportsService.getItemWiseSalesReport(
      fromDate.toISOString(),
      toDate.toISOString()
    ).subscribe({
      next: (response) => {
        this.report.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading item-wise sales report:', error);
        this.toastService.error('Failed to load report');
        this.loading.set(false);
      },
    });
  }
}

