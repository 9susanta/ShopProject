import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { ToastService } from '@core/toast/toast.service';
import { SaleService } from '@core/services/sale.service';
import { Sale } from '@core/models/sale.model';

@Component({
  selector: 'grocery-sale-details',
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
  ],
  template: `
    <div class="sale-details-container p-4 max-w-6xl mx-auto">
      <div class="mb-4">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Sales
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (sale()) {
        <mat-card class="mb-4">
          <mat-card-header>
            <mat-card-title>Invoice: {{ sale()!.invoiceNumber }}</mat-card-title>
            <mat-card-subtitle>
              <mat-chip [color]="sale()!.status === 'Completed' ? 'primary' : 'warn'">
                {{ sale()!.status }}
              </mat-chip>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div>
                <strong>Date:</strong> {{ sale()!.saleDate | date: 'short' }}
              </div>
              @if (sale()!.customerName) {
                <div>
                  <strong>Customer:</strong> {{ sale()!.customerName }}
                </div>
              }
              @if (sale()!.customerPhone) {
                <div>
                  <strong>Phone:</strong> {{ sale()!.customerPhone }}
                </div>
              }
              <div>
                <strong>Payment Method:</strong> {{ sale()!.paymentMethod }}
              </div>
              <div>
                <strong>Subtotal:</strong> {{ sale()!.subTotal | currency: 'INR' }}
              </div>
              @if (sale()!.discountAmount > 0) {
                <div>
                  <strong>Discount:</strong> -{{ sale()!.discountAmount | currency: 'INR' }}
                </div>
              }
              @if (sale()!.taxAmount > 0) {
                <div>
                  <strong>Tax:</strong> {{ sale()!.taxAmount | currency: 'INR' }}
                </div>
              }
              <div class="col-span-2">
                <strong>Total Amount:</strong> {{ sale()!.totalAmount | currency: 'INR' }}
              </div>
              @if (sale()!.loyaltyPointsEarned && sale()!.loyaltyPointsEarned! > 0) {
                <div class="col-span-2 loyalty-points-display">
                  <mat-icon>stars</mat-icon>
                  <strong>Loyalty Points Earned:</strong> 
                  <span class="points-value">{{ sale()!.loyaltyPointsEarned }} points</span>
                </div>
              }
              @if (sale()!.loyaltyPointsRedeemed && sale()!.loyaltyPointsRedeemed! > 0) {
                <div class="col-span-2">
                  <strong>Loyalty Points Redeemed:</strong> {{ sale()!.loyaltyPointsRedeemed }} points
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        @if (sale()!.items && sale()!.items.length > 0) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>Items</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="sale()!.items" class="w-full">
                <ng-container matColumnDef="product">
                  <th mat-header-cell *matHeaderCellDef>Product</th>
                  <td mat-cell *matCellDef="let item">
                    <div>{{ item.productName }}</div>
                    @if (item.offerName) {
                      <div class="text-sm">
                        <mat-chip color="accent" class="text-xs">
                          <mat-icon class="text-sm">local_offer</mat-icon>
                          {{ item.offerName }}
                        </mat-chip>
                      </div>
                    }
                  </td>
                </ng-container>
                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Quantity</th>
                  <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
                </ng-container>
                <ng-container matColumnDef="unitPrice">
                  <th mat-header-cell *matHeaderCellDef>Unit Price</th>
                  <td mat-cell *matCellDef="let item">{{ item.unitPrice | currency: 'INR' }}</td>
                </ng-container>
                <ng-container matColumnDef="discount">
                  <th mat-header-cell *matHeaderCellDef>Discount</th>
                  <td mat-cell *matCellDef="let item">
                    @if (item.discountAmount && item.discountAmount > 0) {
                      <span class="text-green-600">-{{ item.discountAmount | currency: 'INR' }}</span>
                    } @else {
                      <span class="text-gray-400">-</span>
                    }
                  </td>
                </ng-container>
                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef>Total</th>
                  <td mat-cell *matCellDef="let item">{{ item.totalPrice | currency: 'INR' }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['product', 'quantity', 'unitPrice', 'discount', 'total']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['product', 'quantity', 'unitPrice', 'discount', 'total']"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        }
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="text-center py-8">
              <mat-icon class="text-6xl text-gray-400 mb-4">receipt_long</mat-icon>
              <h2 class="text-xl font-semibold mb-2">Sale not found</h2>
              <p class="text-gray-500">The sale you're looking for doesn't exist.</p>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .sale-details-container {
      min-height: calc(100vh - 64px);
    }
    .loyalty-points-display {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: linear-gradient(135deg, #fff3e0, #ffe0b2);
      border-radius: 8px;
      border: 2px solid #ff9800;
    }
    .loyalty-points-display mat-icon {
      color: #ff9800;
    }
    .points-value {
      color: #ff9800;
      font-size: 18px;
      font-weight: 600;
    }
  `]
})
export class SaleDetailsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private saleService = inject(SaleService);

  saleId = signal<string | null>(null);
  sale = signal<Sale | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.saleId.set(id);
      this.loadSale(id);
    } else {
      this.toastService.error('Sale ID is required');
      this.goBack();
    }
  }

  loadSale(id: string): void {
    this.loading.set(true);
    this.saleService.getSaleById(id).subscribe({
      next: (sale) => {
        this.sale.set(sale);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load sale details');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/sales']);
  }
}

