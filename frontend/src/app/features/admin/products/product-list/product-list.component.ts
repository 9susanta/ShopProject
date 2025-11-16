import { Component, OnInit, OnDestroy, AfterViewInit, signal, inject, computed, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ProductService } from '../product.service';
import { Product, ProductFilters } from '@core/models/product.model';
import { ToastService } from '@core/toast/toast.service';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '@environments/environment';

export interface ProductTableItem extends Product {
  categoryName?: string;
}

@Component({
  selector: 'grocery-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  // Using default change detection - signals handle updates efficiently
  // Header stays static because displayedColumns is readonly and header row is stable
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private subscriptions = new Subscription();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Keep displayedColumns as a constant to prevent header re-rendering
  readonly displayedColumns: readonly string[] = [
    'name',
    'sku',
    'barcode',
    'salePrice',
    'mrp',
    'categoryName',
    'isActive',
    'actions',
  ] as const;

  // TrackBy function to prevent unnecessary row re-renders
  trackByProductId(index: number, product: ProductTableItem): string {
    return product.id;
  }

  dataSource = new MatTableDataSource<ProductTableItem>([]);
  products = signal<Product[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(20);

  // Filters
  searchTerm = signal('');
  categoryFilter = signal<string>('');
  supplierFilter = signal<string>('');
  lowStockFilter = signal<boolean | undefined>(undefined);

  // Sorting
  sortBy = signal<string>('name'); // Default sort by name
  sortOrder = signal<'asc' | 'desc'>('asc');

  // Search debounce
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));

  ngOnInit(): void {
    // Set up debounced search
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500), // Wait 500ms after user stops typing
        distinctUntilChanged() // Only trigger if value changed
      )
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadProducts();
      });

    this.loadProducts();
  }

  ngAfterViewInit(): void {
    // Connect MatSort for visual indicators (arrows toggle immediately on click)
    this.dataSource.sort = this.sort;
    // Disable client-side pagination (we use server-side)
    this.dataSource.paginator = null;
    
    // Prevent client-side sorting (we do server-side)
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      return item[property] || '';
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    this.searchSubject.complete();
  }

  loadProducts(): void {
    this.isLoading.set(true);

    const filters: ProductFilters = {
      search: this.searchTerm() || undefined,
      categoryId: this.categoryFilter() || undefined,
      supplierId: this.supplierFilter() || undefined,
      lowStock: this.lowStockFilter(),
      sortBy: this.sortBy() || 'name', // Always provide a sort (default to name)
      sortOrder: this.sortOrder() || 'asc', // Always provide a sort order
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
    };

    // Debug logging (remove in production)
    if (!environment.production) {
      console.debug('Loading products with filters:', filters);
    }

    const sub = this.productService.getProducts(filters).subscribe({
      next: (response) => {
        this.products.set(response.items);
        this.totalCount.set(response.totalCount);
        // Simply update data - header stays static, only rows update
        this.dataSource.data = response.items as ProductTableItem[];
        
        // Update paginator
        if (this.paginator) {
          this.paginator.length = response.totalCount;
          this.paginator.pageIndex = this.currentPage() - 1;
        }
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.toastService.error('Failed to load products');
        this.isLoading.set(false);
      },
    });

    this.subscriptions.add(sub);
  }

  onSearch(): void {
    // Trigger debounced search
    this.searchSubject.next(this.searchTerm());
  }

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
    // Trigger debounced search
    this.searchSubject.next(value);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadProducts();
  }

  onSortChange(sort: Sort): void {
    // Map Material sort field names to backend field names
    const sortByMap: Record<string, string> = {
      'name': 'name',
      'sku': 'sku',
      'barcode': 'barcode',
      'salePrice': 'salePrice',
      'mrp': 'mrp',
      'categoryName': 'categoryName',
      'isActive': 'isActive',
    };

    const backendSortBy = sortByMap[sort.active] || sort.active;
    
    // Update sort state - MatSort already toggled arrow immediately
    if (sort.direction) {
      this.sortBy.set(backendSortBy);
      this.sortOrder.set(sort.direction === 'asc' ? 'asc' : 'desc');
    } else {
      this.sortBy.set('name');
      this.sortOrder.set('asc');
    }

    // Reset to first page and load data
    this.currentPage.set(1);
    this.loadProducts();
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      const sub = this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.toastService.success('Product deleted');
          this.loadProducts();
        },
        error: (error) => {
          this.toastService.error('Failed to delete product');
          console.error('Error deleting product:', error);
        },
      });
      this.subscriptions.add(sub);
    }
  }
}

