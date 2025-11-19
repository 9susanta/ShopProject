import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { PurchasingService } from '@core/services/purchasing.service';
import { ProductService } from '../../admin/products/services/product.service';
import { ToastService } from '@core/toast/toast.service';
import { BarcodeScannerService } from '@core/services/barcode-scanner.service';
import { MasterDataService } from '@core/services/master-data.service';
import {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  Supplier,
  PurchaseOrderItem,
} from '@core/models/purchasing.model';
import { Product } from '@core/models/product.model';
import { UnitDto } from '@core/models/unit.model';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './purchase-order-form.component.html',
  styleUrl: './purchase-order-form.component.css',
})
export class PurchaseOrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private purchasingService = inject(PurchasingService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private barcodeService = inject(BarcodeScannerService);
  private masterDataService = inject(MasterDataService);

  form!: FormGroup;
  isEditMode = signal(false);
  poId = signal<string | null>(null);
  loading = signal(false);
  submitting = signal(false);
  
  suppliers = signal<Supplier[]>([]);
  products = signal<Product[]>([]);
  units = signal<UnitDto[]>([]);
  
  // Filtered options for autocomplete
  filteredSuppliers$!: Observable<Supplier[]>;
  filteredProductsForItem: { [key: number]: Observable<Product[]> } = {};

  displayedColumns: string[] = ['product', 'quantity', 'unit', 'unitPrice', 'gstRate', 'total', 'actions'];

  // Computed values
  hasItems = computed(() => this.items.length > 0);
  subtotal = computed(() => {
    return this.items.controls.reduce((sum, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const unitPrice = control.get('unitPrice')?.value || 0;
      return sum + (quantity * unitPrice);
    }, 0);
  });

  totalGST = computed(() => {
    return this.items.controls.reduce((sum, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const unitPrice = control.get('unitPrice')?.value || 0;
      const gstRate = control.get('gstRate')?.value || 0;
      const subtotal = quantity * unitPrice;
      return sum + (subtotal * gstRate) / 100;
    }, 0);
  });

  totalAmount = computed(() => this.subtotal() + this.totalGST());

  constructor() {
    this.form = this.fb.group({
      supplierId: ['', Validators.required],
      supplierName: [''], // For display
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

    // Check for query params (e.g., from low stock page)
    const productId = this.route.snapshot.queryParamMap.get('productId');
    const suggestedQty = this.route.snapshot.queryParamMap.get('suggestedQty');

    this.loadSuppliers();
    this.loadProducts();
    this.loadUnits();
    this.setupBarcodeScanner();
    this.setupAutocomplete();

    // Pre-fill product if coming from low stock
    if (productId) {
      setTimeout(() => {
        this.addItemByProductId(productId, suggestedQty ? parseInt(suggestedQty) : undefined);
      }, 500);
    }
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  setupAutocomplete(): void {
    // Setup supplier autocomplete
    const supplierNameControl = this.form.get('supplierName');
    if (supplierNameControl) {
      this.filteredSuppliers$ = supplierNameControl.valueChanges.pipe(
        startWith(''),
        map(value => {
          const name = typeof value === 'string' ? value : value?.name || '';
          return name ? this.filterSuppliers(name) : this.suppliers().slice(0, 50); // Limit to 50 for performance
        })
      );
    }
  }

  setupProductAutocomplete(index: number): void {
    const itemForm = this.items.at(index) as FormGroup;
    const productControl = itemForm.get('productName');
    if (productControl && !this.filteredProductsForItem[index]) {
      // Get initial value safely
      const initialValue = productControl.value || '';
      this.filteredProductsForItem[index] = productControl.valueChanges.pipe(
        startWith(initialValue),
        map(value => {
          // Ensure we're always working with a string
          const name = typeof value === 'string' ? value : (value?.name || '');
          // Don't filter if the value looks like an ID (GUID) or order number (PO-XXX)
          if (!name || name.startsWith('PO-') || name.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            return this.products().slice(0, 50);
          }
          return name ? this.filterProducts(name) : this.products().slice(0, 50);
        })
      );
    }
  }

  filterSuppliers(name: string): Supplier[] {
    const filterValue = name.toLowerCase();
    return this.suppliers().filter(s => s.name.toLowerCase().includes(filterValue));
  }

  filterProducts(name: string): Product[] {
    const filterValue = name.toLowerCase();
    return this.products().filter(p => 
      p.name.toLowerCase().includes(filterValue) || 
      (p.sku && p.sku.toLowerCase().includes(filterValue)) ||
      (p.barcode && p.barcode.toLowerCase().includes(filterValue))
    );
  }

  displaySupplier(supplier: Supplier): string {
    return supplier ? supplier.name : '';
  }

  displayProduct(product: Product | string): string {
    if (!product) return '';
    // Handle case where product might be a string (productName from form)
    if (typeof product === 'string') {
      return product;
    }
    return `${product.name}${product.sku ? ` (${product.sku})` : ''}`;
  }

  onSupplierSelected(event: MatAutocompleteSelectedEvent): void {
    const supplier = event.option.value as Supplier;
    this.form.patchValue({
      supplierId: supplier.id,
      supplierName: supplier.name,
    });
  }

  onProductSelected(event: MatAutocompleteSelectedEvent, index: number): void {
    const product = event.option.value as Product;
    const itemForm = this.items.at(index) as FormGroup;
    
    itemForm.patchValue({
      productId: product.id,
      productName: this.displayProduct(product),
      unitPrice: product.salePrice || 0,
      gstRate: product.gstRate || 0,
      unit: product.unitName || 'pcs',
    }, { emitEvent: false });
    
    this.calculateItemTotal(itemForm);
  }

  loadPurchaseOrder(id: string): void {
    this.loading.set(true);
    // Ensure products are loaded before loading the purchase order
    // so we can properly resolve product names
    this.productService.getProducts({ pageSize: 1000, isActive: true }).subscribe({
      next: (response) => {
        this.products.set(response.items);
        
        // Now load the purchase order
        this.purchasingService.getPurchaseOrderById(id).subscribe({
          next: (po: PurchaseOrder) => {
            const supplier = this.suppliers().find(s => s.id === po.supplierId);
            this.form.patchValue({
              supplierId: po.supplierId,
              supplierName: supplier?.name || po.supplierName || '',
              expectedDeliveryDate: po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate) : null,
              remarks: po.remarks || '',
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
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.toastService.error('Failed to load products');
        this.loading.set(false);
      },
    });
  }

  loadSuppliers(): void {
    this.purchasingService.getSuppliers().subscribe({
      next: (response) => {
        this.suppliers.set(response.items);
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.toastService.error('Failed to load suppliers');
      },
    });
  }

  loadProducts(): void {
    this.productService.getProducts({ pageSize: 1000, isActive: true }).subscribe({
      next: (response) => {
        this.products.set(response.items);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.toastService.error('Failed to load products');
      },
    });
  }

  loadUnits(): void {
    this.masterDataService.getUnits().subscribe({
      next: (units) => {
        this.units.set(units);
      },
      error: (error) => {
        console.error('Error loading units:', error);
        // Use defaults if API fails
        const defaultUnits: UnitDto[] = [
          { id: 'kg', name: 'Kilogram', symbol: 'kg', type: 0, sortOrder: 1, isActive: true },
          { id: 'g', name: 'Gram', symbol: 'g', type: 1, sortOrder: 2, isActive: true },
          { id: 'L', name: 'Liter', symbol: 'L', type: 2, sortOrder: 3, isActive: true },
          { id: 'ml', name: 'Milliliter', symbol: 'ml', type: 3, sortOrder: 4, isActive: true },
          { id: 'pcs', name: 'Pieces', symbol: 'pcs', type: 4, sortOrder: 5, isActive: true },
          { id: 'dozen', name: 'Dozen', symbol: 'dozen', type: 6, sortOrder: 6, isActive: true },
        ];
        this.units.set(defaultUnits);
      },
    });
  }

  setupBarcodeScanner(): void {
    this.barcodeService.onBarcodeScanned().subscribe((barcode) => {
      this.productService.getProductByBarcode(barcode).subscribe({
        next: (product) => {
          this.addItemByProduct(product);
          this.toastService.success(`Product added: ${product.name}`);
        },
        error: () => {
          this.toastService.warning(`Product not found for barcode: ${barcode}`);
        },
      });
    });
  }

  addItem(item?: PurchaseOrderItem): void {
    // If loading an existing item, find the product to get the correct name
    let productName = item?.productName || '';
    
    // Validate productName - it shouldn't be a PO number or GUID
    if (productName && (productName.startsWith('PO-') || productName.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i))) {
      productName = ''; // Reset invalid productName
    }
    
    if (item?.productId) {
      // Always try to find the product in our loaded products list to get the correct name
      const product = this.products().find(p => p.id === item.productId);
      if (product) {
        productName = this.displayProduct(product);
      } else if (!productName) {
        // Fallback to SKU if product not found and no name provided
        productName = item.productSKU || `Product ${item.productId.substring(0, 8)}...`;
      }
    }

    const itemForm = this.fb.group({
      productId: [item?.productId || '', Validators.required],
      productName: [productName, Validators.required],
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

    const index = this.items.length;
    this.items.push(itemForm);
    this.setupProductAutocomplete(index);
  }

  addItemByProduct(product: Product): void {
    const itemForm = this.fb.group({
      productId: [product.id, Validators.required],
      productName: [this.displayProduct(product), Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unit: [product.unitName || 'pcs', Validators.required],
      unitPrice: [product.salePrice || 0, [Validators.required, Validators.min(0)]],
      gstRate: [product.gstRate || 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      remarks: [''],
    });

    itemForm.valueChanges.subscribe(() => {
      this.calculateItemTotal(itemForm);
    });

    const index = this.items.length;
    this.items.push(itemForm);
    this.setupProductAutocomplete(index);
  }

  addItemByProductId(productId: string, quantity?: number): void {
    const product = this.products().find(p => p.id === productId);
    if (product) {
      const itemForm = this.fb.group({
        productId: [product.id, Validators.required],
        productName: [this.displayProduct(product), Validators.required],
        quantity: [quantity || 1, [Validators.required, Validators.min(0.01)]],
        unit: [product.unitName || 'pcs', Validators.required],
        unitPrice: [product.salePrice || 0, [Validators.required, Validators.min(0)]],
        gstRate: [product.gstRate || 0, [Validators.required, Validators.min(0), Validators.max(100)]],
        remarks: [''],
      });

      itemForm.valueChanges.subscribe(() => {
        this.calculateItemTotal(itemForm);
      });

      const index = this.items.length;
      this.items.push(itemForm);
      this.setupProductAutocomplete(index);
    }
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    delete this.filteredProductsForItem[index];
    // Reindex filtered products
    const newFiltered: { [key: number]: Observable<Product[]> } = {};
    Object.keys(this.filteredProductsForItem).forEach(key => {
      const oldIndex = parseInt(key);
      if (oldIndex < index) {
        newFiltered[oldIndex] = this.filteredProductsForItem[oldIndex];
      } else if (oldIndex > index) {
        newFiltered[oldIndex - 1] = this.filteredProductsForItem[oldIndex];
      }
    });
    this.filteredProductsForItem = newFiltered;
  }

  calculateItemTotal(itemForm: FormGroup): void {
    // Trigger change detection by updating a computed value
    // The total is calculated in the template using getItemTotal()
  }

  getItemTotal(itemForm: AbstractControl): number {
    const quantity = itemForm.get('quantity')?.value || 0;
    const unitPrice = itemForm.get('unitPrice')?.value || 0;
    const gstRate = itemForm.get('gstRate')?.value || 0;

    const subtotal = quantity * unitPrice;
    const gstAmount = (subtotal * gstRate) / 100;
    return subtotal + gstAmount;
  }

  getProductName(productId: string): string {
    const product = this.products().find((p) => p.id === productId);
    return product?.name || 'Unknown';
  }

  getProductAuto(index: number): any {
    // This method is used to get a reference to the autocomplete
    // Since we can't use template refs in loops, we'll use a workaround
    // The template will use #productAuto which will be unique per row
    return null; // Will be handled by template reference
  }


  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      this.toastService.error('Please fill in all required fields');
      return;
    }

    if (this.items.length === 0) {
      this.toastService.error('Please add at least one item');
      return;
    }

    // Validate all items
    let hasInvalidItems = false;
    this.items.controls.forEach((control, index) => {
      if (control.invalid) {
        hasInvalidItems = true;
        this.markFormGroupTouched(control as FormGroup);
      }
    });

    if (hasInvalidItems) {
      this.toastService.error('Please fix errors in the items table');
      return;
    }

    this.submitting.set(true);

    const formValue = this.form.value;
    const request: CreatePurchaseOrderRequest = {
      supplierId: formValue.supplierId,
      expectedDeliveryDate: formValue.expectedDeliveryDate ? new Date(formValue.expectedDeliveryDate).toISOString() : undefined,
      remarks: formValue.remarks || undefined,
      items: formValue.items.map((item: any) => ({
        productId: item.productId,
        quantity: parseFloat(item.quantity),
        unit: item.unit,
        unitPrice: parseFloat(item.unitPrice),
        gstRate: parseFloat(item.gstRate),
        remarks: item.remarks || undefined,
      })),
    };

    const operation = this.isEditMode()
      ? this.purchasingService.updatePurchaseOrder(this.poId()!, request as UpdatePurchaseOrderRequest)
      : this.purchasingService.createPurchaseOrder(request);

    operation.subscribe({
      next: (po) => {
        this.toastService.success(
          `Purchase order ${this.isEditMode() ? 'updated' : 'created'} successfully`
        );
        // Navigate to list page (tests expect this) or details page
        this.router.navigate(['/admin/purchasing/purchase-orders']).catch((error) => {
          // If navigation fails, try details page
          if (error?.name !== 'NavigationCancellationError') {
            this.router.navigate(['/admin/purchasing/purchase-orders', po.id]).catch(() => {
              console.error('Navigation failed');
            });
          }
        });
      },
      error: (error) => {
        this.toastService.error(`Failed to ${this.isEditMode() ? 'update' : 'create'} purchase order`);
        this.submitting.set(false);
        console.error(error);
      },
    });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(item => {
          if (item instanceof FormGroup) {
            this.markFormGroupTouched(item);
          }
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/purchasing/purchase-orders']);
  }
}
