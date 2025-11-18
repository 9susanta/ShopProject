import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { PurchasingService } from '@core/services/purchasing.service';
import { ToastService } from '@core/toast/toast.service';
import { GoodsReceiveNote, GRNStatus } from '@core/models/purchasing.model';

@Component({
  selector: 'grocery-grn-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  template: `
    <div class="grn-details-container p-4 max-w-6xl mx-auto">
      <div class="mb-4">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to GRNs
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (grn()) {
        <mat-card class="mb-4">
          <mat-card-header>
            <mat-card-title>GRN: {{ grn()!.grnNumber }}</mat-card-title>
            <mat-card-subtitle>
              <mat-chip [style.background-color]="getStatusColor(grn()!.status) + '20'">
                {{ getStatusLabel(grn()!.status) }}
              </mat-chip>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div>
                <strong>PO Number:</strong> {{ grn()!.purchaseOrderNumber }}
              </div>
              <div>
                <strong>Received Date:</strong> {{ grn()!.receivedDate | date: 'short' }}
              </div>
              <div>
                <strong>Total Amount:</strong> {{ grn()!.totalAmount | currency: 'INR' }}
              </div>
              @if (grn()!.confirmedAt) {
                <div>
                  <strong>Confirmed At:</strong> {{ grn()!.confirmedAt | date: 'short' }}
                </div>
              }
            </div>
            @if (grn()!.remarks) {
              <div class="mt-4">
                <strong>Remarks:</strong> {{ grn()!.remarks }}
              </div>
            }
          </mat-card-content>
          <mat-card-actions>
            @if (grn()!.status === GRNStatus.Draft) {
              <button mat-raised-button color="primary" (click)="confirm()">
                <mat-icon>check_circle</mat-icon>
                Confirm GRN
              </button>
            }
            <button mat-button routerLink="/admin/purchasing/purchase-orders/{{ grn()!.purchaseOrderId }}">
              <mat-icon>visibility</mat-icon>
              View Purchase Order
            </button>
          </mat-card-actions>
        </mat-card>

        @if (grn()!.items && grn()!.items.length > 0) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>Items</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="grn()!.items" class="w-full">
                <ng-container matColumnDef="product">
                  <th mat-header-cell *matHeaderCellDef>Product</th>
                  <td mat-cell *matCellDef="let item">{{ item.productName }}</td>
                </ng-container>
                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Quantity</th>
                  <td mat-cell *matCellDef="let item">{{ item.quantity }} {{ item.unit }}</td>
                </ng-container>
                <ng-container matColumnDef="unitPrice">
                  <th mat-header-cell *matHeaderCellDef>Unit Price</th>
                  <td mat-cell *matCellDef="let item">{{ item.unitPrice | currency: 'INR' }}</td>
                </ng-container>
                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef>Total</th>
                  <td mat-cell *matCellDef="let item">{{ item.totalPrice | currency: 'INR' }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['product', 'quantity', 'unitPrice', 'total']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['product', 'quantity', 'unitPrice', 'total']"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        }
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="text-center py-8">
              <mat-icon class="text-6xl text-gray-400 mb-4">inventory</mat-icon>
              <h2 class="text-xl font-semibold mb-2">GRN not found</h2>
              <p class="text-gray-500">The GRN you're looking for doesn't exist.</p>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .grn-details-container {
      min-height: calc(100vh - 64px);
    }
  `],
})
export class GRNDetailsComponent implements OnInit {
  private purchasingService = inject(PurchasingService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  grn = signal<GoodsReceiveNote | null>(null);
  loading = signal(false);
  GRNStatus = GRNStatus;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGRN(id);
    } else {
      this.toastService.error('GRN ID is required');
      this.goBack();
    }
  }

  loadGRN(id: string): void {
    this.loading.set(true);
    this.purchasingService.getGRNById(id).subscribe({
      next: (grn) => {
        this.grn.set(grn);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load GRN');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  getStatusColor(status: GRNStatus): string {
    switch (status) {
      case GRNStatus.Draft:
        return 'gray';
      case GRNStatus.Confirmed:
        return 'green';
      case GRNStatus.Cancelled:
        return 'red';
      case GRNStatus.Voided:
        return 'red';
      default:
        return 'gray';
    }
  }

  getStatusLabel(status: GRNStatus): string {
    return GRNStatus[status] || 'Unknown';
  }

  confirm(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/admin/purchasing/grn', id, 'confirm']);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/purchasing/grn']);
  }
}

