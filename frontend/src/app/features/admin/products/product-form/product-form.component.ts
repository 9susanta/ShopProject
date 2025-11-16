import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { Product, ProductCreateRequest } from '@core/models/product.model';
import { ToastService } from '@core/toast/toast.service';
import { BarcodeScannerService } from '@core/services/barcode-scanner.service';

@Component({
  selector: 'grocery-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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

  productForm: FormGroup;
  isEditMode = signal(false);
  productId = signal<string | null>(null);
  isSubmitting = signal(false);
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      sku: ['', [Validators.required]],
      barcode: [''],
      mrp: [0, [Validators.required, Validators.min(0)]],
      salePrice: [0, [Validators.required, Validators.min(0)]],
      gstRate: [0, [Validators.min(0), Validators.max(100)]],
      categoryId: ['', [Validators.required]],
      supplierId: [''],
      unitId: ['', [Validators.required]],
      description: [''],
      lowStockThreshold: [10, [Validators.required, Validators.min(0)]],
      isActive: [true],
    });
  }

  ngOnInit(): void {
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
          gstRate: product.gstRate,
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
      ...formValue,
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

