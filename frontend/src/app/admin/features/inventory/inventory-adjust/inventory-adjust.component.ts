import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { InventoryService } from '../services/inventory.service';
import { ProductService } from '@core/services/product.service';
import { ToastService } from '@core/toast/toast.service';
import { CreateAdjustmentRequest, InventoryAdjustmentType } from '@core/models/inventory-batch.model';
import { Product } from '@core/models/product.model';

@Component({
  selector: 'grocery-inventory-adjust',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './inventory-adjust.component.html',
  styleUrl: './inventory-adjust.component.css',
})
export class InventoryAdjustComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  adjustmentForm!: FormGroup;
  loading = signal(false);
  submitting = signal(false);
  product = signal<Product | null>(null);
  currentStock = signal<number>(0);

  adjustmentTypes = [
    { value: InventoryAdjustmentType.Manual, label: 'Manual Adjustment' },
    { value: InventoryAdjustmentType.Damage, label: 'Damage' },
    { value: InventoryAdjustmentType.Expiry, label: 'Expiry' },
    { value: InventoryAdjustmentType.SupplierReturn, label: 'Supplier Return' },
    { value: InventoryAdjustmentType.CustomerReturn, label: 'Customer Return' },
    { value: InventoryAdjustmentType.StockTake, label: 'Stock Take' },
    { value: InventoryAdjustmentType.Transfer, label: 'Transfer' },
  ];

  ngOnInit(): void {
    this.initForm();
    
    // Get productId from query params
    const productId = this.route.snapshot.queryParamMap.get('productId');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  initForm(): void {
    this.adjustmentForm = this.fb.group({
      productId: ['', Validators.required],
      quantityChange: [0, [Validators.required, Validators.pattern(/^-?\d+$/)]],
      adjustmentType: [InventoryAdjustmentType.Manual, Validators.required],
      reason: ['', [Validators.required, Validators.minLength(3)]],
      referenceNumber: [''],
      notes: [''],
    });
  }

  loadProduct(productId: string): void {
    this.loading.set(true);
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product.set(product);
        this.currentStock.set((product as any).availableQuantity || 0);
        this.adjustmentForm.patchValue({
          productId: product.id,
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load product');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  onQuantityChange(): void {
    const quantityChange = this.adjustmentForm.get('quantityChange')?.value || 0;
    const newStock = this.currentStock() + quantityChange;
    
    if (newStock < 0) {
      this.adjustmentForm.get('quantityChange')?.setErrors({ negativeStock: true });
    } else {
      this.adjustmentForm.get('quantityChange')?.setErrors(null);
    }
  }

  getNewStock(): number {
    const quantityChange = this.adjustmentForm.get('quantityChange')?.value || 0;
    return this.currentStock() + quantityChange;
  }

  getQuantityChangeLabel(): string {
    const quantityChange = this.adjustmentForm.get('quantityChange')?.value || 0;
    if (quantityChange > 0) {
      return 'Increase Stock';
    } else if (quantityChange < 0) {
      return 'Decrease Stock';
    }
    return 'No Change';
  }

  onSubmit(): void {
    if (this.adjustmentForm.invalid) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    const formValue = this.adjustmentForm.value;
    const request: CreateAdjustmentRequest = {
      productId: formValue.productId,
      quantityChange: parseInt(formValue.quantityChange, 10),
      adjustmentType: formValue.adjustmentType as InventoryAdjustmentType,
      reason: formValue.reason,
      notes: formValue.notes || undefined,
    };

    this.submitting.set(true);
    this.inventoryService.createAdjustment(request).subscribe({
      next: (adjustment) => {
        this.toastService.success('Inventory adjustment created successfully');
        this.router.navigate(['/admin/inventory']);
      },
      error: (error) => {
        this.toastService.error('Failed to create adjustment');
        console.error(error);
        this.submitting.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/inventory']);
  }

  getErrorMessage(controlName: string): string {
    const control = this.adjustmentForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${controlName} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid number';
    }
    if (control?.hasError('negativeStock')) {
      return 'Stock cannot be negative';
    }
    return '';
  }
}
