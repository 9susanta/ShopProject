import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product, ProductCreateRequest } from '@core/models/product.model';
import { ToastService } from '@core/toast/toast.service';
import { BarcodeScannerService } from '@core/services/barcode-scanner.service';
import { MasterDataService } from '@core/services/master-data.service';
import { CategoryDto } from '@core/models/category.model';
import { TaxSlabDto } from '@core/models/taxslab.model';
import { UnitDto } from '@core/models/unit.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'grocery-product-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private barcodeScanner = inject(BarcodeScannerService);
  private masterDataService = inject(MasterDataService);

  productForm: FormGroup;
  isEditMode = signal(false);
  productId = signal<string | null>(null);
  isSubmitting = signal(false);
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  categories = signal<CategoryDto[]>([]);
  taxSlabs = signal<TaxSlabDto[]>([]);
  units = signal<UnitDto[]>([]);
  isLoading = signal(false);

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      sku: ['', [Validators.required]],
      barcode: [''],
      mrp: [0, [Validators.required, Validators.min(0)]],
      salePrice: [0, [Validators.required, Validators.min(0)]],
      taxSlabId: [''], // Added taxSlabId field
      categoryId: ['', [Validators.required]],
      supplierId: [''],
      unitId: ['', [Validators.required]],
      description: [''],
      lowStockThreshold: [10, [Validators.required, Validators.min(0)]],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.loadMasterData();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProduct(id);
    }

    // Listen for barcode scanner input
    this.barcodeScanner.onBarcodeScanned().subscribe(barcode => {
      if (!this.isEditMode()) {
        this.productForm.patchValue({ barcode });
        this.lookupProductByBarcode(barcode);
      }
    });

    // Watch for category changes to auto-fill taxSlabId
    this.productForm.get('categoryId')?.valueChanges.subscribe(categoryId => {
      if (categoryId) {
        this.onCategoryChange(categoryId);
      }
    });
  }

  private loadMasterData(): void {
    this.isLoading.set(true);
    
    this.masterDataService.getCategories().subscribe({
      next: categories => {
        this.categories.set(categories);
      },
      error: error => {
        console.error('Error loading categories:', error);
        this.toastService.error('Failed to load categories');
      },
    });

    this.masterDataService.getTaxSlabs().subscribe({
      next: taxSlabs => {
        this.taxSlabs.set(taxSlabs);
      },
      error: error => {
        console.error('Error loading tax slabs:', error);
        this.toastService.error('Failed to load tax slabs');
      },
    });

    this.masterDataService.getUnits().subscribe({
      next: units => {
        this.units.set(units);
        this.isLoading.set(false);
      },
      error: error => {
        console.error('Error loading units:', error);
        this.toastService.error('Failed to load units');
        this.isLoading.set(false);
      },
    });
  }

  private onCategoryChange(categoryId: string): void {
    const category = this.categories().find(c => c.id === categoryId);
    if (category?.taxSlab) {
      // Auto-fill taxSlabId from category
      this.productForm.patchValue({ taxSlabId: category.taxSlab.id }, { emitEvent: false });
    }
  }

  loadProduct(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          sku: product.sku,
          barcode: product.barcode || '',
          mrp: product.mrp,
          salePrice: product.salePrice,
          taxSlabId: product.taxSlabId || '',
          categoryId: product.categoryId,
          supplierId: product.supplierId || '',
          unitId: product.unitId,
          description: product.description || '',
          lowStockThreshold: product.lowStockThreshold,
          isActive: product.isActive,
        });
        if (product.imageUrl) {
          this.imagePreview.set(product.imageUrl);
        }
        // Auto-fill taxSlabId from category if not set
        if (product.categoryId && !product.taxSlabId) {
          this.onCategoryChange(product.categoryId);
        }
      },
      error: (error) => {
        this.toastService.error('Failed to load product');
        console.error('Error loading product:', error);
      },
    });
  }

  lookupProductByBarcode(barcode: string): void {
    this.productService.getProductByBarcode(barcode).subscribe({
      next: (product) => {
        this.toastService.info('Product found! Loading details...');
        this.router.navigate(['/admin/products/edit', product.id]);
      },
      error: () => {
        // Product not found - allow creation
        this.toastService.info('Product not found. You can create a new one.');
      },
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedImage.set(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.toastService.warning('Please fill in all required fields');
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.productForm.value;
    const productData: ProductCreateRequest = {
      name: formValue.name.trim(),
      sku: formValue.sku.trim(),
      barcode: formValue.barcode?.trim() || undefined,
      categoryId: formValue.categoryId,
      taxSlabId: formValue.taxSlabId || undefined,
      unitId: formValue.unitId,
      mrp: parseFloat(formValue.mrp),
      salePrice: parseFloat(formValue.salePrice),
      description: formValue.description?.trim() || undefined,
      lowStockThreshold: parseInt(formValue.lowStockThreshold, 10),
      image: this.selectedImage() || undefined,
    };

    const request$ = this.isEditMode()
      ? this.productService.updateProduct({ ...productData, id: this.productId()! })
      : this.productService.createProduct(productData);

    request$.subscribe({
      next: () => {
        this.toastService.success(
          `Product ${this.isEditMode() ? 'updated' : 'created'} successfully`
        );
        this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        this.toastService.error(`Failed to ${this.isEditMode() ? 'update' : 'create'} product`);
        console.error('Error saving product:', error);
        this.isSubmitting.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/products']);
  }
}

