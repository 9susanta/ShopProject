import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PurchasingService } from '@core/services/purchasing.service';
import { ToastService } from '@core/toast/toast.service';
import { PurchaseOrder, PurchaseOrderStatus } from '@core/models/purchasing.model';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'grocery-purchase-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatProgressSpinnerModule],
  template: `
    <div class="po-details-container p-4 max-w-6xl mx-auto">
      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (purchaseOrder()) {
        <div class="mb-4">
          <button mat-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Back to List
          </button>
        </div>

        <mat-card class="mb-4">
          <mat-card-header>
            <mat-card-title>Purchase Order: {{ purchaseOrder()!.orderNumber }}</mat-card-title>
            <mat-card-subtitle>
              <mat-chip [style.background-color]="getStatusColor(purchaseOrder()!.status) + '20'">
                {{ getStatusLabel(purchaseOrder()!.status) }}
              </mat-chip>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div>
                <strong>Supplier:</strong> {{ purchaseOrder()!.supplierName }}
              </div>
              <div>
                <strong>Order Date:</strong> {{ purchaseOrder()!.orderDate | date: 'short' }}
              </div>
              <div>
                <strong>Expected Delivery:</strong>
                @if (purchaseOrder()!.expectedDeliveryDate) {
                  {{ purchaseOrder()!.expectedDeliveryDate | date: 'short' }}
                } @else {
                  N/A
                }
              </div>
              <div>
                <strong>Total Amount:</strong> {{ purchaseOrder()!.totalAmount | currency: 'INR' }}
              </div>
            </div>
            @if (purchaseOrder()!.remarks) {
              <div class="mt-4">
                <strong>Remarks:</strong> {{ purchaseOrder()!.remarks }}
              </div>
            }
          </mat-card-content>
          <mat-card-actions>
            @if (purchaseOrder()!.status === PurchaseOrderStatus.Pending && isAdmin()) {
              <button mat-raised-button color="primary" (click)="approve()">Approve</button>
            }
            @if (purchaseOrder()!.status !== PurchaseOrderStatus.Cancelled && isAdmin()) {
              <button mat-raised-button color="warn" (click)="cancel()">Cancel</button>
            }
            <button mat-button routerLink="/admin/purchasing/grn/new" [queryParams]="{ poId: purchaseOrder()!.id }">
              Create GRN
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Items</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="purchaseOrder()!.items" class="w-full">
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
    </div>
  `,
  styles: ['.po-details-container { min-height: calc(100vh - 64px); }'],
})
export class PurchaseOrderDetailsComponent implements OnInit {
  private purchasingService = inject(PurchasingService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  purchaseOrder = signal<PurchaseOrder | null>(null);
  loading = signal(false);
  PurchaseOrderStatus = PurchaseOrderStatus;

  isAdmin = () => this.authService.hasRole('Admin');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPurchaseOrder(id);
    }
  }

  loadPurchaseOrder(id: string): void {
    this.loading.set(true);
    this.purchasingService.getPurchaseOrderById(id).subscribe({
      next: (po) => {
        this.purchaseOrder.set(po);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load purchase order');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  approve(): void {
    const po = this.purchaseOrder();
    if (!po) return;

    this.loading.set(true);
    this.purchasingService.approvePurchaseOrder(po.id).subscribe({
      next: () => {
        this.toastService.success('Purchase order approved');
        this.loadPurchaseOrder(po.id);
      },
      error: (error) => {
        this.toastService.error('Failed to approve purchase order');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  cancel(): void {
    const po = this.purchaseOrder();
    if (!po) return;

    if (!confirm('Are you sure you want to cancel this purchase order?')) {
      return;
    }

    this.loading.set(true);
    this.purchasingService.cancelPurchaseOrder(po.id).subscribe({
      next: () => {
        this.toastService.success('Purchase order cancelled');
        this.loadPurchaseOrder(po.id);
      },
      error: (error) => {
        this.toastService.error('Failed to cancel purchase order');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  getStatusColor(status: PurchaseOrderStatus): string {
    switch (status) {
      case PurchaseOrderStatus.Draft:
        return 'gray';
      case PurchaseOrderStatus.Pending:
        return 'orange';
      case PurchaseOrderStatus.Approved:
        return 'blue';
      case PurchaseOrderStatus.Received:
        return 'green';
      case PurchaseOrderStatus.Cancelled:
        return 'red';
      default:
        return 'gray';
    }
  }

  getStatusLabel(status: PurchaseOrderStatus): string {
    return PurchaseOrderStatus[status] || 'Unknown';
  }

  goBack(): void {
    this.router.navigate(['/admin/purchasing/purchase-orders']);
  }
}

