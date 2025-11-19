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
import { ProductService } from '@core/services/product.service';
import { ToastService } from '@core/toast/toast.service';
import { BarcodeScannerService } from '@core/services/barcode-scanner.service';
import { MasterDataService } from '@core/services/master-data.service';
import {
  PurchaseOrder,
  Supplier,
  CreateGRNRequest,
  CreateGRNItemRequest,
} from '@core/models/purchasing.model';
import { Product } from '@core/models/product.model';
import { UnitDto } from '@core/models/unit.model';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'grocery-grn-form',
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
  templateUrl: './grn-form.component.html',
  styleUrl: './grn-form.component.css',
})
export class GRNFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private purchasingService = inject(PurchasingService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private barcodeService = inject(BarcodeScannerService);
  private masterDataService = inject(MasterDataService);

  form!: FormGroup;
  loading = signal(false);
  submitting = signal(false);
  
  suppliers = signal<Supplier[]>([]);
  products = signal<Product[]>([]);
  units = signal<UnitDto[]>([]);
  purchaseOrder = signal<PurchaseOrder | null>(null);
  
  // Filtered options for autocomplete
  filteredSuppliers$!: Observable<Supplier[]>;
  filteredProductsForItem: { [key: number]: Observable<Product[]> } = {};

  displayedColumns: string[] = ['product', 'quantity', 'unitCost', 'batchNumber', 'expiryDate', 'total', 'actions'];

  // Computed values
  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  hasItems = computed(() => this.items.length > 0);
  
  totalAmount = computed(() => {
    return this.items.controls.reduce((sum, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const unitCost = control.get('unitCost')?.value || 0;
      return sum + (quantity * unitCost);
    }, 0);
  });

  ngOnInit(): void {
    this.initializeForm();
    this.loadSuppliers();
    this.loadProducts();
    this.loadUnits();
    this.setupBarcodeScanner();
    
    // Check if creating from PO
    const poId = this.route.snapshot.queryParams['poId'];
    if (poId) {
      this.loadPurchaseOrder(poId);
    }
  }

  initializeForm(): void {
    this.form = this.fb.group({
      supplierId: ['', Validators.required],
      purchaseOrderId: [null],
      receiveDate: [new Date(), Validators.required],
      invoiceNumber: [''],
      remarks: [''],
      items: this.fb.array([]),
    });

    // Setup supplier autocomplete
    this.filteredSuppliers$ = this.form.get('supplierId')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name || '';
        return name ? this.filterSuppliers(name) : this.suppliers().slice();
      })
    );
  }

  loadSuppliers(): void {
    this.loading.set(true);
    this.purchasingService.getSuppliers().subscribe({
      next: (response) => {
        this.suppliers.set(response.items || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
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
        // Use default units if API fails
        const defaultUnits: UnitDto[] = [
          { id: '1', name: 'pcs', symbol: 'pcs', isActive: true, type: 'Count' as any, sortOrder: 1 },
          { id: '2', name: 'kg', symbol: 'kg', isActive: true, type: 'Weight' as any, sortOrder: 2 },
          { id: '3', name: 'gm', symbol: 'gm', isActive: true, type: 'Weight' as any, sortOrder: 3 },
          { id: '4', name: 'litre', symbol: 'L', isActive: true, type: 'Volume' as any, sortOrder: 4 },
        ];
        this.units.set(defaultUnits);
      },
    });
  }

  loadPurchaseOrder(poId: string): void {
    this.loading.set(true);
    this.purchasingService.getPurchaseOrderById(poId).subscribe({
      next: (po) => {
        this.purchaseOrder.set(po);
        this.form.patchValue({
          supplierId: po.supplierId,
          purchaseOrderId: po.id,
          receiveDate: new Date(),
        });
        
        // Pre-fill items from PO
        if (po.items && po.items.length > 0) {
          po.items.forEach(item => {
            this.addItemFromPO(item);
          });
        }
        
        this.loading.set(false);
        this.toastService.success('Purchase Order loaded successfully');
      },
      error: (error) => {
        console.error('Error loading purchase order:', error);
        this.toastService.error('Failed to load purchase order');
        this.loading.set(false);
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

  filterSuppliers(name: string): Supplier[] {
    const filterValue = name.toLowerCase();
    return this.suppliers().filter(supplier =>
      supplier.name.toLowerCase().includes(filterValue)
    );
  }

  displaySupplier(supplier: Supplier): string {
    return supplier ? supplier.name : '';
  }

  onSupplierSelected(event: MatAutocompleteSelectedEvent): void {
    const supplier = event.option.value;
    this.form.patchValue({ supplierId: supplier.id });
  }

  addItem(item?: Partial<CreateGRNItemRequest> & { productName?: string; quantity?: number }): void {
    const itemForm = this.fb.group({
      productId: [item?.productId || '', Validators.required],
      productName: [item?.productName || '', Validators.required],
      quantity: [item?.quantity || item?.receivedQuantity || 1, [Validators.required, Validators.min(0.01)]],
      unitCost: [item?.unitCost || 0, [Validators.required, Validators.min(0)]],
      batchNumber: [item?.batchNumber || ''],
      expiryDate: [item?.expiryDate ? new Date(item.expiryDate) : null],
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

  addItemFromPO(poItem: any): void {
    const product = this.products().find(p => p.id === poItem.productId);
    const itemForm = this.fb.group({
      productId: [poItem.productId || '', Validators.required],
      productName: [product?.name || poItem.productName || '', Validators.required],
      quantity: [poItem.quantity || 1, [Validators.required, Validators.min(0.01)]],
      unitCost: [poItem.unitPrice || 0, [Validators.required, Validators.min(0)]],
      batchNumber: [''],
      expiryDate: [null],
      remarks: [poItem.remarks || ''],
    });

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
      productName: [product.name, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitCost: [product.salePrice || 0, [Validators.required, Validators.min(0)]],
      batchNumber: [''],
      expiryDate: [null],
      remarks: [''],
    });

    itemForm.valueChanges.subscribe(() => {
      this.calculateItemTotal(itemForm);
    });

    const index = this.items.length;
    this.items.push(itemForm);
    this.setupProductAutocomplete(index);
  }

  setupProductAutocomplete(index: number): void {
    const itemControl = this.items.at(index);
    const productControl = itemControl.get('productName');
    
    if (productControl) {
      this.filteredProductsForItem[index] = productControl.valueChanges.pipe(
        startWith(''),
        map(value => {
          const name = typeof value === 'string' ? value : value?.name || '';
          return name ? this.filterProducts(name) : this.products().slice();
        })
      );
    }
  }

  filterProducts(name: string): Product[] {
    const filterValue = name.toLowerCase();
    return this.products().filter(product =>
      product.name.toLowerCase().includes(filterValue) ||
      product.sku.toLowerCase().includes(filterValue)
    );
  }

  displayProduct(product: Product): string {
    return product ? `${product.name} (${product.sku})` : '';
  }

  onProductSelected(event: MatAutocompleteSelectedEvent, index: number): void {
    const product = event.option.value;
    const itemControl = this.items.at(index);
    itemControl.patchValue({
      productId: product.id,
      productName: product.name,
      unitCost: product.salePrice || 0,
    });
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    delete this.filteredProductsForItem[index];
  }

  calculateItemTotal(itemForm: AbstractControl): void {
    const quantity = itemForm.get('quantity')?.value || 0;
    const unitCost = itemForm.get('unitCost')?.value || 0;
    // Total is calculated in template
  }

  getItemTotal(index: number): number {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitCost = item.get('unitCost')?.value || 0;
    return quantity * unitCost;
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

    this.submitting.set(true);

    const formValue = this.form.value;
    const request: CreateGRNRequest = {
      supplierId: formValue.supplierId,
      purchaseOrderId: formValue.purchaseOrderId || undefined,
      receiveDate: formValue.receiveDate.toISOString(),
      remarks: formValue.remarks || undefined,
      items: this.items.controls.map(control => {
        const itemValue = control.value;
        return {
          productId: itemValue.productId,
          expectedQuantity: itemValue.quantity,
          receivedQuantity: itemValue.quantity,
          unit: 'pcs', // Default unit
          unitCost: itemValue.unitCost,
          gstRate: 0, // Can be enhanced to get from product
          batchNumber: itemValue.batchNumber || undefined,
          expiryDate: itemValue.expiryDate ? itemValue.expiryDate.toISOString() : undefined,
          remarks: itemValue.remarks || undefined,
        } as CreateGRNItemRequest;
      }),
    };

    this.purchasingService.createGRN(request).subscribe({
      next: (grn) => {
        this.toastService.success('GRN created successfully');
        this.router.navigate(['/admin/purchasing/grn', grn.id]);
      },
      error: (error) => {
        console.error('Error creating GRN:', error);
        this.toastService.error(error?.error?.message || 'Failed to create GRN');
        this.submitting.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/purchasing/grn']);
  }
}
