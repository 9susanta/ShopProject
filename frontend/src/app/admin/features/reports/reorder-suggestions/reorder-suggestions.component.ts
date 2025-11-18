import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportsService } from '@core/services/reports.service';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'grocery-reorder-suggestions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="reorder-suggestions-container p-4 max-w-7xl mx-auto">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Reorder Suggestions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="mb-4">
            <mat-checkbox [(ngModel)]="onlyBelowReorderPoint" (change)="loadReport()">
              Only show products below reorder point
            </mat-checkbox>
            <button mat-raised-button color="primary" (click)="loadReport()" [disabled]="loading()" class="ml-4">
              Refresh
            </button>
          </div>

          @if (loading()) {
            <div class="flex justify-center p-8">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (suggestions().length === 0) {
            <div class="text-center py-8 text-gray-500">
              <p>No reorder suggestions</p>
            </div>
          } @else {
            <table mat-table [dataSource]="suggestions()" class="w-full">
              <ng-container matColumnDef="productName">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let item">{{ item.productName }}</td>
              </ng-container>
              <ng-container matColumnDef="currentStock">
                <th mat-header-cell *matHeaderCellDef>Current Stock</th>
                <td mat-cell *matCellDef="let item">{{ item.currentStock }}</td>
              </ng-container>
              <ng-container matColumnDef="reorderPoint">
                <th mat-header-cell *matHeaderCellDef>Reorder Point</th>
                <td mat-cell *matCellDef="let item">{{ item.reorderPoint }}</td>
              </ng-container>
              <ng-container matColumnDef="suggestedQuantity">
                <th mat-header-cell *matHeaderCellDef>Suggested Qty</th>
                <td mat-cell *matCellDef="let item">{{ item.suggestedQuantity }}</td>
              </ng-container>
              <ng-container matColumnDef="estimatedCost">
                <th mat-header-cell *matHeaderCellDef>Estimated Cost</th>
                <td mat-cell *matCellDef="let item">₹{{ item.estimatedCost | number: '1.2-2' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['productName', 'currentStock', 'reorderPoint', 'suggestedQuantity', 'estimatedCost']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['productName', 'currentStock', 'reorderPoint', 'suggestedQuantity', 'estimatedCost']"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.reorder-suggestions-container { min-height: calc(100vh - 64px); }`]
})
export class ReorderSuggestionsComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private toastService = inject(ToastService);

  suggestions = signal<any[]>([]);
  loading = signal(false);
  onlyBelowReorderPoint = true;

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);
    this.reportsService.getReorderSuggestions(this.onlyBelowReorderPoint).subscribe({
      next: (response) => {
        this.suggestions.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading reorder suggestions:', error);
        this.toastService.error('Failed to load suggestions');
        this.loading.set(false);
      },
    });
  }
}

