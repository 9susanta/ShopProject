import { Component, OnInit, signal, inject } from '@angular/core';
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
import { PurchasingService } from '@core/services/purchasing.service';
import { ProductService } from '../../admin/products/services/product.service';
import { ToastService } from '@core/toast/toast.service';
import { Supplier, CreateSupplierReturnRequest, CreateSupplierReturnItemRequest } from '@core/models/purchasing.model';
import { Product } from '@core/models/product.model';

@Component({
  selector: 'grocery-supplier-return-form',
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
  ],
  template: `
    <div class="p-4 max-w-6xl mx-auto">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create Supplier Return</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (loading()) {
            <div class="flex justify-center p-8">
              <mat-spinner></mat-spinner>
            </div>
          } @else {
            <form [formGroup]="returnForm" (ngSubmit)="onSubmit()">
              <div class="grid grid-cols-2 gap-4 mb-4">
                <mat-form-field appearance="outline">
                  <mat-label>Supplier *</mat-label>
                  <mat-select formControlName="supplierId" required>
                    @for (supplier of suppliers(); track supplier.id) {
                      <mat-option [value]="supplier.id">{{ supplier.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Return Date *</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="returnDate" required>
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="w-full mb-4">
                <mat-label>Reason *</mat-label>
                <textarea matInput formControlName="reason" rows="3" required></textarea>
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full mb-4">
                <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" rows="2"></textarea>
              </mat-form-field>
              <div class="flex justify-end gap-2 mb-4">
                <button mat-raised-button type="button" (click)="addItem()">Add Item</button>
              </div>
              <table mat-table [dataSource]="items.controls" class="w-full mb-4">
                <ng-container matColumnDef="product">
                  <th mat-header-cell *matHeaderCellDef>Product</th>
                  <td mat-cell *matCellDef="let item; let i = index">
                    <mat-select [formControl]="getProductControl(i)" class="w-full">
                      @for (product of products(); track product.id) {
                        <mat-option [value]="product.id">{{ product.name }}</mat-option>
                      }
                    </mat-select>
                  </td>
                </ng-container>
                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Quantity</th>
                  <td mat-cell *matCellDef="let item; let i = index">
                    <input matInput type="number" [formControl]="getQuantityControl(i)" min="1" class="w-24">
                  </td>
                </ng-container>
                <ng-container matColumnDef="unitCost">
                  <th mat-header-cell *matHeaderCellDef>Unit Cost</th>
                  <td mat-cell *matCellDef="let item; let i = index">
                    <input matInput type="number" [formControl]="getUnitCostControl(i)" min="0" step="0.01" class="w-24">
                  </td>
                </ng-container>
                <ng-container matColumnDef="reason">
                  <th mat-header-cell *matHeaderCellDef>Reason</th>
                  <td mat-cell *matCellDef="let item; let i = index">
                    <input matInput [formControl]="getItemReasonControl(i)" class="w-full">
                  </td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let item; let i = index">
                    <button mat-icon-button type="button" (click)="removeItem(i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['product', 'quantity', 'unitCost', 'reason', 'actions']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['product', 'quantity', 'unitCost', 'reason', 'actions']"></tr>
              </table>
              <div class="flex justify-end gap-2">
                <button mat-button type="button" (click)="goBack()">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="returnForm.invalid || submitting()">
                  @if (submitting()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    Create Return
                  }
                </button>
              </div>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: ['.w-full { width: 100%; } .w-24 { width: 6rem; }'],
})
export class SupplierReturnFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private purchasingService = inject(PurchasingService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  returnForm!: FormGroup;
  loading = signal(false);
  submitting = signal(false);
  suppliers = signal<Supplier[]>([]);
  products = signal<Product[]>([]);
  displayedColumns: string[] = ['product', 'quantity', 'unitCost', 'reason', 'actions'];

  ngOnInit(): void {
    this.returnForm = this.fb.group({
      supplierId: ['', Validators.required],
      grnId: [null],
      returnDate: [new Date(), Validators.required],
      reason: ['', Validators.required],
      notes: [''],
      items: this.fb.array([]),
    });
    this.loadSuppliers();
    this.loadProducts();
  }

  get items(): FormArray {
    return this.returnForm.get('items') as FormArray;
  }

  getProductControl(index: number): FormControl {
    return this.items.at(index).get('productId') as FormControl;
  }

  getQuantityControl(index: number): FormControl {
    return this.items.at(index).get('quantity') as FormControl;
  }

  getUnitCostControl(index: number): FormControl {
    return this.items.at(index).get('unitCost') as FormControl;
  }

  getItemReasonControl(index: number): FormControl {
    return this.items.at(index).get('reason') as FormControl;
  }

  loadSuppliers(): void {
    this.loading.set(true);
    this.purchasingService.getSuppliers().subscribe({
      next: (response) => {
        this.suppliers.set(response.items || []);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load suppliers');
        this.loading.set(false);
      },
    });
  }

  loadProducts(): void {
    this.productService.getProducts({ pageSize: 1000 }).subscribe({
      next: (response) => {
        this.products.set(response.items || []);
      },
      error: () => {
        this.toastService.error('Failed to load products');
      },
    });
  }

  addItem(): void {
    this.items.push(
      this.fb.group({
        productId: ['', Validators.required],
        batchId: [null],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitCost: [0, [Validators.required, Validators.min(0)]],
        reason: ['', Validators.required],
      })
    );
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onSubmit(): void {
    if (this.returnForm.invalid || this.items.length === 0) {
      this.toastService.error('Please fill all required fields and add at least one item');
      return;
    }

    this.submitting.set(true);
    const formValue = this.returnForm.value;
    const request: CreateSupplierReturnRequest = {
      supplierId: formValue.supplierId,
      grnId: formValue.grnId,
      returnDate: formValue.returnDate.toISOString(),
      reason: formValue.reason,
      notes: formValue.notes,
      items: formValue.items.map((item: any) => ({
        productId: item.productId,
        batchId: item.batchId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        reason: item.reason,
      })),
    };

    this.purchasingService.createSupplierReturn(request).subscribe({
      next: (response) => {
        this.toastService.success(`Supplier return ${response.returnNumber} created successfully`);
        this.router.navigate(['/admin/purchasing/supplier-returns']);
      },
      error: (error) => {
        this.toastService.error(error?.error?.message || 'Failed to create supplier return');
        this.submitting.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/purchasing']);
  }
}

