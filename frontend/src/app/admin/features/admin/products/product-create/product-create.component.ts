import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { ProductService } from '../services/product.service';
import { MasterDataService } from '@core/services/master-data.service';
import { CategoryService } from '@core/services/category.service';
import { ToastService } from '@core/toast/toast.service';
import { BarcodeScannerService } from '@core/services/barcode-scanner.service';
import { ProductCreateRequest, Product } from '@core/models/product.model';
import { CategoryDto } from '@core/models/category.model';
import { TaxSlabDto } from '@core/models/taxslab.model';
import { UnitDto } from '@core/models/unit.model';
import { CategoryCreateModalComponent } from '../category-create-modal/category-create-modal.component';
import { ConfirmDialogComponent } from '../../../../../admin/shared/components/confirm-dialog/confirm-dialog.component';
import { ImagePreviewComponent } from '../../../../../admin/shared/components/image-preview/image-preview.component';

// Custom validator: SalePrice <= MRP
function salePriceValidator(control: AbstractControl): ValidationErrors | null {
  const formGroup = control.parent;
  if (!formGroup) return null;
  
  const mrp = formGroup.get('mrp')?.value;
  const salePrice = control.value;
  
  if (mrp != null && salePrice != null && salePrice > mrp) {
    return { salePriceExceedsMRP: true };
  }
  return null;
}

@Component({
  selector: 'grocery-product-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    ImagePreviewComponent,
  ],
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.css'],
})
export class ProductCreateComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private productService = inject(ProductService);
  private masterDataService = inject(MasterDataService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  private barcodeScanner = inject(BarcodeScannerService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  @ViewChild('barcodeInput', { static: false }) barcodeInput?: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput', { static: false }) fileInput?: ElementRef<HTMLInputElement>;

  productForm: FormGroup;
  categories = signal<CategoryDto[]>([]);
  taxSlabs = signal<TaxSlabDto[]>([]);
  units = signal<UnitDto[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  duplicateProductWarning = signal<Product | null>(null);
  continueAfterSave = signal(false);

  private barcodeCheckSubject = new Subject<string>();

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      sku: ['', [Validators.maxLength(50)]],
      barcode: ['', [Validators.maxLength(50)]],
      categoryId: ['', [Validators.required]],
      taxSlabId: ['', []], // Optional - auto-filled from category
      unitId: ['', [Validators.required]],
      mrp: [0, [Validators.required, Validators.min(0)]],
      salePrice: [0, [Validators.required, Validators.min(0), salePriceValidator]],
      description: ['', [Validators.maxLength(1000)]],
      lowStockThreshold: [10, [Validators.required, Validators.min(0)]],
      isActive: [true],
    });

    // Watch for category changes to auto-fill taxSlabId
    this.productForm.get('categoryId')?.valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(categoryId => {
        if (categoryId) {
          this.onCategoryChange(categoryId);
        }
      });

    // Watch for barcode changes with debounce
    this.barcodeCheckSubject
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(barcode => {
          if (!barcode || barcode.length < 3) {
            this.duplicateProductWarning.set(null);
            return of(null);
          }
          return this.productService.getProductByBarcode(barcode).pipe(
            catchError(() => {
              // Product not found - no duplicate
              this.duplicateProductWarning.set(null);
              return of(null);
            })
          );
        })
      )
      .subscribe(product => {
        if (product) {
          this.duplicateProductWarning.set(product);
        } else {
          this.duplicateProductWarning.set(null);
        }
        this.cdr.markForCheck();
      });
  }

  ngOnInit(): void {
    this.loadMasterData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.barcodeCheckSubject.complete();
  }

  private loadMasterData(): void {
    this.isLoading.set(true);
    
    // Load all master data in parallel
    this.masterDataService.getCategories().subscribe({
      next: categories => {
        this.categories.set(categories);
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Error loading categories:', error);
        this.toastService.error('Failed to load categories');
      },
    });

    this.masterDataService.getTaxSlabs().subscribe({
      next: taxSlabs => {
        this.taxSlabs.set(taxSlabs);
        this.cdr.markForCheck();
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
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Error loading units:', error);
        this.toastService.error('Failed to load units');
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  private onCategoryChange(categoryId: string): void {
    const category = this.categories().find(c => c.id === categoryId);
    if (category?.taxSlab) {
      // Auto-fill taxSlabId from category
      this.productForm.patchValue({ taxSlabId: category.taxSlab.id }, { emitEvent: false });
      this.cdr.markForCheck();
    }
  }

  onBarcodeInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.barcodeCheckSubject.next(value);
  }

  onBarcodeBlur(): void {
    const barcode = this.productForm.get('barcode')?.value;
    if (barcode) {
      this.barcodeCheckSubject.next(barcode);
    }
  }

  onPrefillFromDuplicate(): void {
    const duplicate = this.duplicateProductWarning();
    if (!duplicate) return;

    this.productForm.patchValue({
      name: duplicate.name,
      sku: duplicate.sku,
      mrp: duplicate.mrp,
      salePrice: duplicate.salePrice,
      categoryId: duplicate.categoryId,
      unitId: duplicate.unitId,
      description: duplicate.description,
      lowStockThreshold: duplicate.lowStockThreshold,
    });

    if (duplicate.categoryId) {
      this.onCategoryChange(duplicate.categoryId);
    }

    this.duplicateProductWarning.set(null);
    this.toastService.info('Form prefilled from existing product');
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastService.error('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error('Image size must be less than 5MB');
        return;
      }
      this.selectedImage.set(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview.set(e.target.result);
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  onImageRemove(): void {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedImage.set(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview.set(e.target.result);
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  openCategoryModal(): void {
    const dialogRef = this.dialog.open(CategoryCreateModalComponent, {
      width: '600px',
      disableClose: true,
      ariaLabelledBy: 'category-modal-title',
      ariaDescribedBy: 'category-modal-description',
    });

    dialogRef.afterClosed().subscribe((newCategory: CategoryDto | null) => {
      if (newCategory) {
        // Add to cache and select it
        this.masterDataService.addCategoryToCache(newCategory);
        this.categories.set([...this.categories(), newCategory]);
        this.productForm.patchValue({ categoryId: newCategory.id });
        this.onCategoryChange(newCategory.id);
        this.toastService.success('Category created and selected');
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid || this.isSubmitting()) {
      this.markFormGroupTouched(this.productForm);
      return;
    }

    // Show confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Create Product',
        message: 'Are you sure you want to create this product with these details?',
        confirmText: 'Create',
        cancelText: 'Cancel',
        confirmColor: 'primary',
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.createProduct();
      }
    });
  }

  private createProduct(): void {
    this.isSubmitting.set(true);
    const formValue = this.productForm.value;

    // Ensure SKU has a value - generate from name if empty
    let skuValue = formValue.sku?.trim();
    if (!skuValue || skuValue === '') {
      // Generate SKU from product name
      skuValue = formValue.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 20) || 'SKU-' + Date.now().toString().slice(-6);
    }

    const request: ProductCreateRequest = {
      name: formValue.name.trim(),
      sku: skuValue,
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

    this.productService
      .createProduct(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product: Product) => {
          this.toastService.success('Product created successfully');
          this.snackBar.open('Product created successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });

          if (this.continueAfterSave()) {
            // Reset form but keep master data
            this.productForm.reset({
              lowStockThreshold: 10,
              isActive: true,
            });
            this.selectedImage.set(null);
            this.imagePreview.set(null);
            this.duplicateProductWarning.set(null);
            this.isSubmitting.set(false);
            this.cdr.markForCheck();
          } else {
            // Navigate to product list
            this.router.navigate(['/admin/products']);
          }
        },
        error: (error: any) => {
          console.error('Error creating product:', error);
          const errorMessage = error?.error?.message || 'Failed to create product';
          
          // Handle validation errors
          if (error?.error?.errors) {
            const validationErrors = error.error.errors;
            Object.keys(validationErrors).forEach(key => {
              const control = this.productForm.get(key);
              if (control) {
                control.setErrors({ serverError: validationErrors[key] });
              }
            });
          }

          this.toastService.error(errorMessage);
          this.snackBar.open(errorMessage, 'Retry', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          }).onAction().subscribe(() => {
            this.createProduct();
          });

          this.isSubmitting.set(false);
          this.cdr.markForCheck();
        },
      });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.productForm.get(controlName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(controlName)} is required`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    if (control?.hasError('min')) {
      return `Value must be greater than or equal to 0`;
    }
    if (control?.hasError('salePriceExceedsMRP')) {
      return 'Sale price cannot be greater than MRP';
    }
    if (control?.hasError('serverError')) {
      return control.errors?.['serverError'];
    }
    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: Record<string, string> = {
      name: 'Product name',
      sku: 'SKU',
      barcode: 'Barcode',
      categoryId: 'Category',
      taxSlabId: 'Tax slab',
      unitId: 'Unit',
      mrp: 'MRP',
      salePrice: 'Sale price',
      lowStockThreshold: 'Low stock threshold',
    };
    return labels[controlName] || controlName;
  }

  getCategoryDisplay(category: CategoryDto): string {
    if (category.taxSlab) {
      return `${category.name} (${category.taxSlab.rate}%)`;
    }
    return category.name;
  }

  getUnitDisplay(unit: UnitDto): string {
    return `${unit.name} (${unit.symbol})`;
  }

  onCancel(): void {
    this.router.navigate(['/admin/products']);
  }
}

