import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PurchasingService } from '@core/services/purchasing.service';
// ProductService will be injected - using master-data service or product service if available
import { ToastService } from '@core/toast/toast.service';
import { BarcodeScannerService } from '@core/services/barcode-scanner.service';
import { ApiService } from '@core/services/api.service';
import {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  Supplier,
  PurchaseOrderItem,
} from '@core/models/purchasing.model';
import { Product } from '@core/models/product.model';
import { UnitDto } from '@core/models/unit.model';

@Component({
  selector: 'grocery-purchase-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatTableModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './purchase-order-form.component.html',
  styleUrl: './purchase-order-form.component.css',
})
export class PurchaseOrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private purchasingService = inject(PurchasingService);
  // Product service - using ApiService directly for now
  private api = inject(ApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private barcodeService = inject(BarcodeScannerService);

  form!: FormGroup;
  isEditMode = signal(false);
  poId = signal<string | null>(null);
  loading = signal(false);
  suppliers = signal<Supplier[]>([]);
  products = signal<Product[]>([]);
  units = signal<UnitDto[]>([]);
  filteredSuppliers = signal<Supplier[]>([]);
  filteredProducts = signal<Product[]>([]);

  displayedColumns: string[] = ['product', 'quantity', 'unit', 'unitPrice', 'gstRate', 'total', 'actions'];

  constructor() {
    this.form = this.fb.group({
      supplierId: ['', Validators.required],
      expectedDeliveryDate: [''],
      remarks: [''],
      items: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.poId.set(id);
      this.loadPurchaseOrder(id);
    }

    this.loadSuppliers();
    this.loadProducts();
    this.loadUnits();
    this.setupBarcodeScanner();
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  loadPurchaseOrder(id: string): void {
    this.loading.set(true);
    this.purchasingService.getPurchaseOrderById(id).subscribe({
      next: (po: PurchaseOrder) => {
        this.form.patchValue({
          supplierId: po.supplierId,
          expectedDeliveryDate: po.expectedDeliveryDate,
          remarks: po.remarks,
        });

        po.items.forEach((item) => {
          this.addItem(item);
        });

        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load purchase order');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  loadSuppliers(): void {
    this.purchasingService.getSuppliers().subscribe({
      next: (response) => {
        this.suppliers.set(response.items);
        this.filteredSuppliers.set(response.items);
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
      },
    });
  }

  loadProducts(): void {
    // Load products via API service
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

  loadUnits(): void {
    // Load units from service if available, otherwise use defaults
    const defaultUnits: UnitDto[] = [
      { id: 'kg', name: 'Kilogram', symbol: 'kg', type: 0, sortOrder: 1, isActive: true },
      { id: 'g', name: 'Gram', symbol: 'g', type: 1, sortOrder: 2, isActive: true },
      { id: 'L', name: 'Liter', symbol: 'L', type: 2, sortOrder: 3, isActive: true },
      { id: 'ml', name: 'Milliliter', symbol: 'ml', type: 3, sortOrder: 4, isActive: true },
      { id: 'pcs', name: 'Pieces', symbol: 'pcs', type: 4, sortOrder: 5, isActive: true },
      { id: 'dozen', name: 'Dozen', symbol: 'dozen', type: 6, sortOrder: 6, isActive: true },
    ];
    this.units.set(defaultUnits);
  }

  setupBarcodeScanner(): void {
    this.barcodeService.onBarcodeScanned().subscribe((barcode) => {
      // Find product by barcode and add to form
      this.api.get<any>(`products/by-barcode/${barcode}`, { cache: true }).subscribe({
        next: (product) => {
          this.addItemByProduct(product);
        },
        error: () => {
          this.toastService.warning(`Product not found for barcode: ${barcode}`);
        },
      });
    });
  }

  addItem(item?: PurchaseOrderItem): void {
    const itemForm = this.fb.group({
      productId: [item?.productId || '', Validators.required],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(0.01)]],
      unit: [item?.unit || 'pcs', Validators.required],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      gstRate: [item?.gstRate || 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      remarks: [item?.remarks || ''],
    });

    // Calculate total on changes
    itemForm.valueChanges.subscribe(() => {
      this.calculateItemTotal(itemForm);
    });

    this.items.push(itemForm);
  }

  addItemByProduct(product: Product): void {
    const itemForm = this.fb.group({
      productId: [product.id, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unit: [(product as any).unit || 'pcs', Validators.required],
      unitPrice: [(product as any).costPrice || (product as any).purchasePrice || 0, [Validators.required, Validators.min(0)]],
      gstRate: [product.gstRate || 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      remarks: [''],
    });

    itemForm.valueChanges.subscribe(() => {
      this.calculateItemTotal(itemForm);
    });

    this.items.push(itemForm);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  calculateItemTotal(itemForm: FormGroup): void {
    const quantity = itemForm.get('quantity')?.value || 0;
    const unitPrice = itemForm.get('unitPrice')?.value || 0;
    const gstRate = itemForm.get('gstRate')?.value || 0;

    const subtotal = quantity * unitPrice;
    const gstAmount = (subtotal * gstRate) / 100;
    const total = subtotal + gstAmount;

    // Store calculated values (not in form, just for display)
    itemForm.patchValue({ _calculatedTotal: total }, { emitEvent: false });
  }

  getItemTotal(itemForm: FormGroup): number {
    const quantity = itemForm.get('quantity')?.value || 0;
    const unitPrice = itemForm.get('unitPrice')?.value || 0;
    const gstRate = itemForm.get('gstRate')?.value || 0;

    const subtotal = quantity * unitPrice;
    const gstAmount = (subtotal * gstRate) / 100;
    return subtotal + gstAmount;
  }

  getTotalAmount(): number {
    return this.items.controls.reduce((sum, control) => {
      return sum + this.getItemTotal(control as FormGroup);
    }, 0);
  }

  getTotalGST(): number {
    return this.items.controls.reduce((sum, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const unitPrice = control.get('unitPrice')?.value || 0;
      const gstRate = control.get('gstRate')?.value || 0;
      const subtotal = quantity * unitPrice;
      return sum + (subtotal * gstRate) / 100;
    }, 0);
  }

  getProductName(productId: string): string {
    const product = this.products().find((p) => p.id === productId);
    return product?.name || 'Unknown';
  }

  filterSuppliers(value: string): void {
    const filterValue = value.toLowerCase();
    this.filteredSuppliers.set(
      this.suppliers().filter((s) => s.name.toLowerCase().includes(filterValue))
    );
  }

  filterProducts(value: string): void {
    const filterValue = value.toLowerCase();
    this.filteredProducts.set(
      this.products().filter((p) => p.name.toLowerCase().includes(filterValue) || p.sku?.toLowerCase().includes(filterValue))
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    if (this.items.length === 0) {
      this.toastService.error('Please add at least one item');
      return;
    }

    this.loading.set(true);

    const formValue = this.form.value;
    const request = {
      supplierId: formValue.supplierId,
      expectedDeliveryDate: formValue.expectedDeliveryDate,
      remarks: formValue.remarks,
      items: formValue.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        gstRate: item.gstRate,
        remarks: item.remarks,
      })),
    };

    const operation = this.isEditMode()
      ? this.purchasingService.updatePurchaseOrder(this.poId()!, request as UpdatePurchaseOrderRequest)
      : this.purchasingService.createPurchaseOrder(request as CreatePurchaseOrderRequest);

    operation.subscribe({
      next: (po) => {
        this.toastService.success(
          `Purchase order ${this.isEditMode() ? 'updated' : 'created'} successfully`
        );
        this.router.navigate(['/purchasing/purchase-orders', po.id]);
      },
      error: (error) => {
        this.toastService.error(`Failed to ${this.isEditMode() ? 'update' : 'create'} purchase order`);
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/purchasing/purchase-orders']);
  }
}

