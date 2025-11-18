import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ToastService } from '@core/toast/toast.service';
import { SaleService } from '@core/services/sale.service';
import { SaleReturnService, CreateSaleReturnRequest, SaleReturnItemRequest } from '@core/services/sale-return.service';
import { Sale, SaleItem } from '@core/models/sale.model';

@Component({
  selector: 'grocery-sale-return-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  template: `
    <div class="sale-return-form-container p-4 max-w-6xl mx-auto">
      <div class="mb-4">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (sale()) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>Create Return for Invoice: {{ sale()!.invoiceNumber }}</mat-card-title>
            <mat-card-subtitle>Date: {{ sale()!.saleDate | date: 'short' }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="returnForm" (ngSubmit)="onSubmit()">
              <div class="grid grid-cols-2 gap-4 mb-4">
                <mat-form-field appearance="outline">
                  <mat-label>Return Date</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="returnDate" required />
                  <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                  @if (returnForm.get('returnDate')?.hasError('required') && returnForm.get('returnDate')?.touched) {
                    <mat-error>Return date is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Reason *</mat-label>
                  <mat-select formControlName="reason" required>
                    <mat-option value="Damaged">Damaged</mat-option>
                    <mat-option value="Defective">Defective</mat-option>
                    <mat-option value="Wrong Item">Wrong Item</mat-option>
                    <mat-option value="Customer Request">Customer Request</mat-option>
                    <mat-option value="Other">Other</mat-option>
                  </mat-select>
                  @if (returnForm.get('reason')?.hasError('required') && returnForm.get('reason')?.touched) {
                    <mat-error>Reason is required</mat-error>
                  }
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="w-full mb-4">
                <mat-label>Notes (Optional)</mat-label>
                <textarea matInput formControlName="notes" rows="3"></textarea>
              </mat-form-field>

              <div class="mb-4">
                <h3 class="text-lg font-semibold mb-2">Select Items to Return</h3>
                <table mat-table [dataSource]="saleItems()" class="w-full">
                  <ng-container matColumnDef="product">
                    <th mat-header-cell *matHeaderCellDef>Product</th>
                    <td mat-cell *matCellDef="let item">
                      {{ item.productName }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="quantity">
                    <th mat-header-cell *matHeaderCellDef>Original Qty</th>
                    <td mat-cell *matCellDef="let item">
                      {{ item.quantity }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="unitPrice">
                    <th mat-header-cell *matHeaderCellDef>Unit Price</th>
                    <td mat-cell *matCellDef="let item">
                      {{ item.unitPrice | currency: 'INR' }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="returnQty">
                    <th mat-header-cell *matHeaderCellDef>Return Qty</th>
                    <td mat-cell *matCellDef="let item; let i = index">
                      <mat-form-field appearance="outline" class="w-24">
                        <input
                          matInput
                          type="number"
                          [min]="0"
                          [max]="item.quantity"
                          [formControl]="getReturnQuantityControl(i)"
                          (change)="updateReturnItem(i)"
                        />
                      </mat-form-field>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="returnAmount">
                    <th mat-header-cell *matHeaderCellDef>Return Amount</th>
                    <td mat-cell *matCellDef="let item; let i = index">
                      {{ getReturnAmount(i) | currency: 'INR' }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="itemReason">
                    <th mat-header-cell *matHeaderCellDef>Item Reason</th>
                    <td mat-cell *matCellDef="let item; let i = index">
                      <mat-form-field appearance="outline" class="w-full">
                        <input matInput [formControl]="getItemReasonControl(i)" placeholder="Reason for this item" />
                      </mat-form-field>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
                </table>
              </div>

              <div class="mb-4 p-4 bg-gray-50 rounded">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-semibold">Total Refund Amount:</span>
                  <span class="text-xl font-bold text-green-600">
                    {{ totalRefundAmount() | currency: 'INR' }}
                  </span>
                </div>
              </div>

              <div class="flex gap-2 justify-end">
                <button mat-button type="button" (click)="goBack()">Cancel</button>
                <button
                  mat-raised-button
                  color="primary"
                  type="submit"
                  [disabled]="returnForm.invalid || submitting() || totalRefundAmount() === 0"
                >
                  @if (submitting()) {
                    <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                  }
                  Create Return
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .sale-return-form-container {
      min-height: calc(100vh - 64px);
    }
    table {
      width: 100%;
    }
  `],
})
export class SaleReturnFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private saleService = inject(SaleService);
  private saleReturnService = inject(SaleReturnService);
  private toastService = inject(ToastService);

  sale = signal<Sale | null>(null);
  saleItems = signal<SaleItem[]>([]);
  loading = signal(false);
  submitting = signal(false);
  returnForm!: FormGroup;

  displayedColumns: string[] = ['product', 'quantity', 'unitPrice', 'returnQty', 'returnAmount', 'itemReason'];

  totalRefundAmount = computed(() => {
    const items = this.saleItems();
    let total = 0;
    items.forEach((item, index) => {
      const qty = this.getReturnQuantityControl(index)?.value || 0;
      total += qty * item.unitPrice;
    });
    return total;
  });

  ngOnInit(): void {
    const saleId = this.route.snapshot.params['id'];
    if (saleId) {
      this.loadSale(saleId);
    }

    this.returnForm = this.fb.group({
      returnDate: [new Date(), Validators.required],
      reason: ['', Validators.required],
      notes: [''],
    });
  }

  private loadSale(saleId: string): void {
    this.loading.set(true);
    this.saleService.getSaleById(saleId).subscribe({
      next: (sale) => {
        this.sale.set(sale);
        this.saleItems.set(sale.items || []);
        // Initialize return quantity controls
        sale.items?.forEach((_, index) => {
          this.returnForm.addControl(`returnQty_${index}`, this.fb.control(0, [Validators.min(0)]));
          this.returnForm.addControl(`itemReason_${index}`, this.fb.control(''));
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load sale details');
        console.error(error);
        this.loading.set(false);
      },
    });
  }

  getReturnQuantityControl(index: number): FormControl {
    return this.returnForm.get(`returnQty_${index}`) as FormControl;
  }

  getItemReasonControl(index: number): FormControl {
    return this.returnForm.get(`itemReason_${index}`) as FormControl;
  }

  getReturnAmount(index: number): number {
    const qty = this.getReturnQuantityControl(index)?.value || 0;
    const item = this.saleItems()[index];
    return qty * (item?.unitPrice || 0);
  }

  updateReturnItem(index: number): void {
    const qty = this.getReturnQuantityControl(index)?.value || 0;
    const item = this.saleItems()[index];
    if (qty > item.quantity) {
      this.getReturnQuantityControl(index)?.setValue(item.quantity);
      this.toastService.warning(`Cannot return more than original quantity (${item.quantity})`);
    }
  }

  onSubmit(): void {
    if (this.returnForm.invalid || this.totalRefundAmount() === 0) {
      this.toastService.error('Please select items to return');
      return;
    }

    const sale = this.sale();
    if (!sale) return;

    const items: SaleReturnItemRequest[] = [];
    this.saleItems().forEach((item, index) => {
      const returnQty = this.getReturnQuantityControl(index)?.value || 0;
      if (returnQty > 0) {
        items.push({
          saleItemId: item.id,
          quantity: returnQty,
          unitPrice: item.unitPrice,
          reason: this.getItemReasonControl(index)?.value || this.returnForm.get('reason')?.value || 'Customer Request',
        });
      }
    });

    if (items.length === 0) {
      this.toastService.error('Please select at least one item to return');
      return;
    }

    const request: CreateSaleReturnRequest = {
      saleId: sale.id,
      returnDate: this.returnForm.get('returnDate')?.value.toISOString(),
      reason: this.returnForm.get('reason')?.value,
      notes: this.returnForm.get('notes')?.value || undefined,
      items,
    };

    this.submitting.set(true);
    this.saleReturnService.createSaleReturn(sale.id, request).subscribe({
      next: (saleReturn) => {
        this.toastService.success(`Return created successfully: ${saleReturn.returnNumber}`);
        this.router.navigate(['/admin/sales', sale.id]);
      },
      error: (error) => {
        this.toastService.error(error?.error?.message || 'Failed to create return');
        console.error(error);
        this.submitting.set(false);
      },
    });
  }

  goBack(): void {
    const sale = this.sale();
    if (sale) {
      this.router.navigate(['/admin/sales', sale.id]);
    } else {
      this.router.navigate(['/admin/sales']);
    }
  }
}

