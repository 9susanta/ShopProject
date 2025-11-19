import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ToastService } from '@core/toast/toast.service';
import { ApiService } from '@core/services/api.service';
import {
  CreateAdjustmentRequest,
  InventoryAdjustmentType,
} from '@core/models/inventory-batch.model';

@Component({
  selector: 'grocery-adjustment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './adjustment-form.component.html',
  styleUrl: './adjustment-form.component.css',
})
export class AdjustmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  form!: FormGroup;
  loading = signal(false);
  products = signal<any[]>([]);
  batches = signal<any[]>([]);
  filteredProducts = signal<any[]>([]);

  adjustmentTypes = [
    { value: InventoryAdjustmentType.Manual, label: 'Manual Adjustment' },
    { value: InventoryAdjustmentType.Damage, label: 'Damage' },
    { value: InventoryAdjustmentType.Expiry, label: 'Expiry' },
    { value: InventoryAdjustmentType.SupplierReturn, label: 'Supplier Return' },
    { value: InventoryAdjustmentType.CustomerReturn, label: 'Customer Return' },
    { value: InventoryAdjustmentType.StockTake, label: 'Stock Take' },
    { value: InventoryAdjustmentType.Transfer, label: 'Transfer' },
  ];

  constructor() {
    this.form = this.fb.group({
      productId: ['', Validators.required],
      batchId: [''],
      adjustmentType: [InventoryAdjustmentType.Manual, Validators.required],
      quantityChange: [0, [Validators.required, (control: any) => control.value === 0 ? { notEqual: true } : null]],
      reason: ['', Validators.required],
      notes: [''],
      linkedGRNId: [''],
      linkedSaleId: [''],
    });
  }

  ngOnInit(): void {
    this.loadProducts();

    // Watch product changes to load batches
    this.form.get('productId')?.valueChanges.subscribe((productId) => {
      if (productId) {
        this.loadBatches(productId);
      } else {
        this.batches.set([]);
      }
    });

    // Pre-fill from query params if available
    const batchId = this.route.snapshot.queryParams['batchId'];
    const productId = this.route.snapshot.queryParams['productId'];
    if (batchId) {
      this.form.patchValue({ batchId });
    }
    if (productId) {
      this.form.patchValue({ productId });
    }
  }

  loadProducts(): void {
    this.api.get<any>('products', { params: { pageSize: 1000 }, cache: true }).subscribe({
      next: (response: any) => {
        const items = response.items || response || [];
        this.products.set(items);
        this.filteredProducts.set(items);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      },
    });
  }

  loadBatches(productId: string): void {
    this.inventoryService.getProductById(productId).subscribe({
      next: (product) => {
        this.batches.set(product.batches || []);
      },
      error: (error) => {
        console.error('Error loading batches:', error);
      },
    });
  }

  filterProducts(value: string): void {
    const filterValue = value.toLowerCase();
    this.filteredProducts.set(
      this.products().filter(
        (p) => p.name.toLowerCase().includes(filterValue) || p.sku?.toLowerCase().includes(filterValue)
      )
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    this.loading.set(true);
    const formValue = this.form.value;

    const request: CreateAdjustmentRequest = {
      productId: formValue.productId,
      batchId: formValue.batchId || undefined,
      adjustmentType: formValue.adjustmentType,
      quantityChange: formValue.quantityChange,
      reason: formValue.reason,
      notes: formValue.notes || undefined,
      linkedGRNId: formValue.linkedGRNId || undefined,
      linkedSaleId: formValue.linkedSaleId || undefined,
    };

    this.inventoryService.createAdjustment(request).subscribe({
      next: (adjustment) => {
        this.toastService.success('Stock adjustment created successfully');
        this.router.navigate(['/inventory/adjustments']);
      },
      error: (error) => {
        this.toastService.error('Failed to create adjustment');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/inventory/adjustments']);
  }
}

