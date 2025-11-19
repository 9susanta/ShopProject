import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { OfferService } from '@core/services/offer.service';
import { Offer, OfferType, CreateOfferRequest, UpdateOfferRequest } from '@core/models/offer.model';
import { ToastService } from '@core/toast/toast.service';
import { CategoryService } from '@core/services/category.service';
import { ProductService } from '../../products/services/product.service';
import { CategoryDto } from '@core/models/category.model';
import { Product } from '@core/models/product.model';

@Component({
  selector: 'grocery-offer-form',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './offer-form.component.html',
  styleUrls: ['./offer-form.component.css'],
})
export class OfferFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private offerService = inject(OfferService);
  private toastService = inject(ToastService);
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);

  offerForm: FormGroup;
  isEditMode = signal(false);
  offerId = signal<string | null>(null);
  isSubmitting = signal(false);
  categories = signal<CategoryDto[]>([]);
  products = signal<Product[]>([]);

  readonly OfferType = OfferType;
  readonly offerTypeOptions = [
    { value: OfferType.BuyOneGetOne, label: 'Buy One Get One' },
    { value: OfferType.PercentageDiscount, label: 'Percentage Discount' },
    { value: OfferType.FlatDiscount, label: 'Flat Discount' },
    { value: OfferType.QuantityBasedDiscount, label: 'Quantity Based Discount' },
    { value: OfferType.CouponCode, label: 'Coupon Code' },
    { value: OfferType.FestivalSale, label: 'Festival Sale' },
  ];

  scopeType = signal<'product' | 'category' | 'store'>('store');

  constructor() {
    this.offerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      type: [OfferType.PercentageDiscount, [Validators.required]],
      discountValue: [0, [Validators.required, Validators.min(0)]],
      minQuantity: [null, [Validators.min(1)]],
      maxQuantity: [null, [Validators.min(1)]],
      productId: [null],
      categoryId: [null],
      couponCode: [''],
      startDate: [new Date(), [Validators.required]],
      endDate: [new Date(), [Validators.required]],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.offerId.set(id);
      this.loadOffer(id);
    }
  }

  loadOffer(id: string): void {
    this.offerService.getOfferById(id).subscribe({
      next: (offer) => {
        const startDate = new Date(offer.startDate);
        const endDate = new Date(offer.endDate);

        this.offerForm.patchValue({
          name: offer.name,
          description: offer.description || '',
          type: offer.type,
          discountValue: offer.discountValue,
          minQuantity: offer.minQuantity,
          maxQuantity: offer.maxQuantity,
          productId: offer.productId || null,
          categoryId: offer.categoryId || null,
          couponCode: offer.couponCode || '',
          startDate: startDate,
          endDate: endDate,
          isActive: offer.isActive,
        });

        if (offer.productId) {
          this.scopeType.set('product');
        } else if (offer.categoryId) {
          this.scopeType.set('category');
        } else {
          this.scopeType.set('store');
        }
      },
      error: (error) => {
        this.toastService.error('Failed to load offer');
        console.error('Error loading offer:', error);
      },
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
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
      },
    });
  }

  onScopeTypeChange(): void {
    const scope = this.scopeType();
    if (scope === 'product') {
      this.offerForm.patchValue({ categoryId: null });
    } else if (scope === 'category') {
      this.offerForm.patchValue({ productId: null });
    } else {
      this.offerForm.patchValue({ productId: null, categoryId: null });
    }
  }

  onSubmit(): void {
    if (this.offerForm.invalid) {
      this.markFormGroupTouched(this.offerForm);
      this.toastService.error('Please fill in all required fields');
      return;
    }

    const formValue = this.offerForm.value;
    const scope = this.scopeType();

    const request: CreateOfferRequest | UpdateOfferRequest = {
      name: formValue.name,
      description: formValue.description || undefined,
      type: formValue.type,
      discountValue: formValue.discountValue,
      minQuantity: formValue.minQuantity || undefined,
      maxQuantity: formValue.maxQuantity || undefined,
      productId: scope === 'product' ? formValue.productId : undefined,
      categoryId: scope === 'category' ? formValue.categoryId : undefined,
      couponCode: formValue.couponCode || undefined,
      startDate: formValue.startDate.toISOString(),
      endDate: formValue.endDate.toISOString(),
      isActive: formValue.isActive ?? true,
    };

    if (this.isEditMode()) {
      (request as UpdateOfferRequest).id = this.offerId()!;
    }

    this.isSubmitting.set(true);

    const operation = this.isEditMode()
      ? this.offerService.updateOffer(request as UpdateOfferRequest)
      : this.offerService.createOffer(request as CreateOfferRequest);

    operation.subscribe({
      next: (offer) => {
        this.toastService.success(`Offer ${this.isEditMode() ? 'updated' : 'created'} successfully`);
        this.router.navigate(['/admin/offers']);
      },
      error: (error) => {
        this.toastService.error(`Failed to ${this.isEditMode() ? 'update' : 'create'} offer`);
        console.error('Error saving offer:', error);
        this.isSubmitting.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/offers']);
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}

