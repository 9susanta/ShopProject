import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { OfferService } from '@core/services/offer.service';
import { Offer, OfferType } from '@core/models/offer.model';
import { ToastService } from '@core/toast/toast.service';
import { CategoryService } from '@core/services/category.service';
import { ProductService } from '../../products/services/product.service';
import { CategoryDto } from '@core/models/category.model';
import { Product } from '@core/models/product.model';

@Component({
  selector: 'grocery-offer-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.css'],
})
export class OfferListComponent implements OnInit {
  private offerService = inject(OfferService);
  private toastService = inject(ToastService);
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);

  offers = signal<Offer[]>([]);
  categories = signal<CategoryDto[]>([]);
  products = signal<Product[]>([]);
  loading = signal(false);

  // Filters
  isActiveFilter = signal<boolean | undefined>(undefined);
  isValidFilter = signal<boolean | undefined>(undefined);
  categoryFilter = signal<string>('');
  productFilter = signal<string>('');

  displayedColumns: string[] = [
    'name',
    'type',
    'discountValue',
    'scope',
    'couponCode',
    'validity',
    'isActive',
    'isValid',
    'actions',
  ];

  readonly OfferType = OfferType;

  filteredOffers = computed(() => {
    let filtered = [...this.offers()];

    if (this.isActiveFilter() !== undefined) {
      filtered = filtered.filter(o => o.isActive === this.isActiveFilter());
    }

    if (this.isValidFilter() !== undefined) {
      filtered = filtered.filter(o => o.isValid === this.isValidFilter());
    }

    if (this.categoryFilter()) {
      filtered = filtered.filter(o => o.categoryId === this.categoryFilter());
    }

    if (this.productFilter()) {
      filtered = filtered.filter(o => o.productId === this.productFilter());
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadOffers();
    this.loadCategories();
    this.loadProducts();
  }

  loadOffers(): void {
    this.loading.set(true);
    
    // Build filters object, excluding undefined values
    const filters: any = {};
    if (this.isActiveFilter() !== undefined) {
      filters.isActive = this.isActiveFilter();
    }
    if (this.isValidFilter() !== undefined) {
      filters.isValid = this.isValidFilter();
    }
    if (this.categoryFilter() && this.categoryFilter() !== '') {
      filters.categoryId = this.categoryFilter();
    }
    if (this.productFilter() && this.productFilter() !== '') {
      filters.productId = this.productFilter();
    }
    
    this.offerService.getOffers(Object.keys(filters).length > 0 ? filters : undefined).subscribe({
      next: (offers) => {
        this.offers.set(offers);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load offers');
        console.error('Error loading offers:', error);
        this.loading.set(false);
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

  getOfferTypeLabel(type: OfferType): string {
    return OfferType[type] || 'Unknown';
  }

  getScopeLabel(offer: Offer): string {
    if (offer.productName) {
      return `Product: ${offer.productName}`;
    }
    if (offer.categoryName) {
      return `Category: ${offer.categoryName}`;
    }
    return 'Store-wide';
  }

  deleteOffer(offer: Offer): void {
    if (!confirm(`Are you sure you want to delete offer "${offer.name}"?`)) {
      return;
    }

    this.offerService.deleteOffer(offer.id).subscribe({
      next: () => {
        this.toastService.success('Offer deleted successfully');
        this.loadOffers();
      },
      error: (error) => {
        this.toastService.error('Failed to delete offer');
        console.error('Error deleting offer:', error);
      },
    });
  }

  toggleActive(offer: Offer): void {
    const updatedOffer: any = {
      id: offer.id,
      name: offer.name,
      description: offer.description,
      type: offer.type,
      discountValue: offer.discountValue,
      minQuantity: offer.minQuantity,
      maxQuantity: offer.maxQuantity,
      productId: offer.productId,
      categoryId: offer.categoryId,
      couponCode: offer.couponCode,
      startDate: offer.startDate,
      endDate: offer.endDate,
      isActive: !offer.isActive,
    };

    this.offerService.updateOffer(updatedOffer).subscribe({
      next: () => {
        this.toastService.success(`Offer ${offer.isActive ? 'deactivated' : 'activated'} successfully`);
        this.loadOffers();
      },
      error: (error) => {
        this.toastService.error('Failed to update offer');
        console.error('Error updating offer:', error);
      },
    });
  }

  applyFilters(): void {
    this.loadOffers();
  }

  clearFilters(): void {
    this.isActiveFilter.set(undefined);
    this.isValidFilter.set(undefined);
    this.categoryFilter.set('');
    this.productFilter.set('');
    this.loadOffers();
  }
}

