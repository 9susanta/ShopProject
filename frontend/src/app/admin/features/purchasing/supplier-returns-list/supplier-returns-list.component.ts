import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PurchasingService } from '@core/services/purchasing.service';
import { ToastService } from '@core/toast/toast.service';
import { SupplierReturn } from '@core/models/purchasing.model';

@Component({
  selector: 'grocery-supplier-returns-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <div class="p-4 max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Supplier Returns</h1>
        <button mat-raised-button color="primary" routerLink="/admin/purchasing/supplier-returns/new">
          <mat-icon>add</mat-icon>
          New Return
        </button>
      </div>
      <mat-card>
        @if (loading()) {
          <div class="flex justify-center p-8">
            <mat-spinner></mat-spinner>
          </div>
        } @else {
          <table mat-table [dataSource]="returns()" class="w-full">
            <ng-container matColumnDef="returnNumber">
              <th mat-header-cell *matHeaderCellDef>Return Number</th>
              <td mat-cell *matCellDef="let ret">
                <a [routerLink]="['/admin/purchasing/supplier-returns', ret.id]" class="text-blue-600 hover:underline">
                  {{ ret.returnNumber }}
                </a>
              </td>
            </ng-container>
            <ng-container matColumnDef="supplierName">
              <th mat-header-cell *matHeaderCellDef>Supplier</th>
              <td mat-cell *matCellDef="let ret">{{ ret.supplierName }}</td>
            </ng-container>
            <ng-container matColumnDef="returnDate">
              <th mat-header-cell *matHeaderCellDef>Return Date</th>
              <td mat-cell *matCellDef="let ret">{{ ret.returnDate | date: 'short' }}</td>
            </ng-container>
            <ng-container matColumnDef="totalAmount">
              <th mat-header-cell *matHeaderCellDef>Total Amount</th>
              <td mat-cell *matCellDef="let ret">{{ ret.totalAmount | currency: 'INR' }}</td>
            </ng-container>
            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef>Reason</th>
              <td mat-cell *matCellDef="let ret">{{ ret.reason }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="['returnNumber', 'supplierName', 'returnDate', 'totalAmount', 'reason']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['returnNumber', 'supplierName', 'returnDate', 'totalAmount', 'reason']"></tr>
          </table>
        }
      </mat-card>
    </div>
  `,
})
export class SupplierReturnsListComponent implements OnInit {
  private purchasingService = inject(PurchasingService);
  private toastService = inject(ToastService);

  returns = signal<SupplierReturn[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['returnNumber', 'supplierName', 'returnDate', 'totalAmount', 'reason'];

  ngOnInit(): void {
    this.loadReturns();
  }

  loadReturns(): void {
    this.loading.set(true);
    this.purchasingService.getSupplierReturns().subscribe({
      next: (data) => {
        this.returns.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load supplier returns');
        this.loading.set(false);
      },
    });
  }
}



