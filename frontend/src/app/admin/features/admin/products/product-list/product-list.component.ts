import { Component, OnInit, OnDestroy, AfterViewInit, signal, inject, computed, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProductService } from '../services/product.service';
import { Product, ProductFilters } from '@core/models/product.model';
import { ToastService } from '@core/toast/toast.service';
import { CategoryService } from '@core/services/category.service';
import { CategoryDto } from '@core/models/category.model';
import { Subject, Subscription, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
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
    MatCheckboxModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  // Using default change detection - signals handle updates efficiently
  // Header stays static because displayedColumns is readonly and header row is stable
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
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
    'stock',
    'categoryName',
    'isActive',
    'actions',
  ] as const;

  // Note: Material tables handle rendering efficiently without explicit trackBy

  dataSource = new MatTableDataSource<ProductTableItem>([]);
  products = signal<Product[]>([]);
  categories = signal<CategoryDto[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(20);

  // Filters
  searchTerm = signal('');
  categoryFilter = signal<string[]>([]);
  categorySearchTerm = signal('');
  supplierFilter = signal<string>('');
  lowStockFilter = signal<boolean | undefined>(undefined);

  // Sorting
  sortBy = signal<string>('name'); // Default sort by name
  sortOrder = signal<'asc' | 'desc'>('asc');

  // Search debounce
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));

  // Filtered categories for search
  filteredCategories = computed(() => {
    const search = this.categorySearchTerm().toLowerCase();
    if (!search) {
      return this.categories();
    }
    return this.categories().filter(cat => 
      cat.name.toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    // Read sort parameters from query string if available
    this.route.queryParams.subscribe(params => {
      if (params['sortBy']) {
        this.sortBy.set(params['sortBy']);
      }
      if (params['sortOrder'] === 'asc' || params['sortOrder'] === 'desc') {
        this.sortOrder.set(params['sortOrder']);
      }
      if (params['pageNumber']) {
        this.currentPage.set(parseInt(params['pageNumber'], 10) || 1);
      }
      if (params['pageSize']) {
        this.pageSize.set(parseInt(params['pageSize'], 10) || 20);
      }
    });

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

    // Load categories and products
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    const sub = this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // Don't show error toast for categories, just log it
      },
    });
    this.subscriptions.add(sub);
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

    // Restore sort state after view is initialized
    this.restoreSortState();
  }

  private restoreSortState(): void {
    // Use setTimeout to ensure MatSort is fully initialized and DOM is ready
    setTimeout(() => {
      if (this.sort) {
        const currentSortBy = this.sortBy();
        const currentSortOrder = this.sortOrder();
        
        // Set MatSort state to match our internal state
        // This will update the visual arrows
        this.sort.active = currentSortBy;
        this.sort.direction = currentSortOrder === 'asc' ? 'asc' : 'desc';
        
        // Force update of MatSort visual state
        // This ensures the arrows are displayed correctly
        this.cdr.detectChanges();
        
        // Additional check: if sort state didn't update, try again after a short delay
        if (this.sort.active !== currentSortBy || this.sort.direction !== currentSortOrder) {
          setTimeout(() => {
            if (this.sort) {
              this.sort.active = currentSortBy;
              this.sort.direction = currentSortOrder === 'asc' ? 'asc' : 'desc';
              this.cdr.detectChanges();
            }
          }, 50);
        }
        
        // Final verification and force update
        setTimeout(() => {
          if (this.sort && this.sort.active === currentSortBy) {
            // Ensure direction is correct
            if (this.sort.direction !== currentSortOrder) {
              this.sort.direction = currentSortOrder === 'asc' ? 'asc' : 'desc';
              this.cdr.detectChanges();
            }
          }
        }, 200);
        
        if (!environment.production) {
          console.debug('Sort state restored:', {
            active: this.sort.active,
            direction: this.sort.direction,
            sortBy: currentSortBy,
            sortOrder: currentSortOrder,
            matches: this.sort.active === currentSortBy && this.sort.direction === currentSortOrder
          });
        }
      }
    }, 100);
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

    const currentSortBy = this.sortBy() || 'name';
    const currentSortOrder = this.sortOrder() || 'asc';

    const filters: ProductFilters = {
      search: this.searchTerm() || undefined,
      categoryId: this.categoryFilter().length > 0 ? this.categoryFilter()[0] : undefined, // Backend may only support single category filter
      supplierId: this.supplierFilter() || undefined,
      lowStock: this.lowStockFilter(),
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
    };

    // Debug logging (remove in production)
    if (!environment.production) {
      console.debug('Loading products with filters:', filters);
      console.debug('Sort state:', {
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
        matSortActive: this.sort?.active,
        matSortDirection: this.sort?.direction
      });
    }

    const sub = this.productService.getProducts(filters).subscribe({
      next: (response) => {
        this.products.set(response.items);
        this.totalCount.set(response.totalCount);
        
        // Map products with category names (use API-provided categoryName, fallback to local lookup)
        const productsWithCategories: ProductTableItem[] = response.items.map(product => {
          // Use categoryName from API if available, otherwise lookup from local categories
          const categoryName = product.categoryName || 
            this.categories().find(cat => cat.id === product.categoryId)?.name || 
            '-';
          return {
            ...product,
            categoryName: categoryName,
          } as ProductTableItem;
        });
        
        // Simply update data - header stays static, only rows update
        this.dataSource.data = productsWithCategories;
        
        // Update paginator
        if (this.paginator) {
          this.paginator.length = response.totalCount;
          this.paginator.pageIndex = this.currentPage() - 1;
        }
        
        // Restore sort state after data is loaded to ensure arrows are correct
        this.restoreSortState();
        
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
    const previousSortBy = this.sortBy();
    const previousSortOrder = this.sortOrder();
    
    // Determine sort direction
    // If clicking the same column, toggle direction
    // If clicking a different column, start with 'asc'
    let newDirection: 'asc' | 'desc' = 'asc';
    
    if (previousSortBy === backendSortBy) {
      // Same column clicked - toggle direction
      newDirection = previousSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Different column - start with 'asc'
      newDirection = 'asc';
    }
    
    // Update sort state immediately
    this.sortBy.set(backendSortBy);
    this.sortOrder.set(newDirection);
    
    // Update MatSort visual state immediately to reflect the change
    // This ensures the arrow direction updates right away
    if (this.sort) {
      this.sort.active = sort.active;
      this.sort.direction = newDirection;
    }

    // Debug logging
    if (!environment.production) {
      console.debug('Sort changed:', {
        active: sort.active,
        direction: newDirection,
        backendSortBy,
        previousSortBy,
        previousSortOrder,
        matSortDirection: this.sort?.direction
      });
    }

    // Reset to first page and load data
    this.currentPage.set(1);
    this.loadProducts();
  }

  /**
   * Sort by specific column and direction (called by arrow clicks)
   */
  sortByColumn(column: string, direction: 'asc' | 'desc'): void {
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

    const backendSortBy = sortByMap[column] || column;
    
    // Update sort state
    this.sortBy.set(backendSortBy);
    this.sortOrder.set(direction);
    
    // Update MatSort visual state
    if (this.sort) {
      this.sort.active = column;
      this.sort.direction = direction;
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

  getCategoryName(categoryId: string): string {
    const category = this.categories().find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  }

  /**
   * Get the low stock filter value as a string for Material select
   */
  getLowStockFilterValue(): string {
    const value = this.lowStockFilter();
    if (value === undefined) {
      return '';
    }
    return value ? 'true' : 'false';
  }

  /**
   * Handle low stock filter change
   */
  onLowStockChange(value: string): void {
    if (value === '') {
      this.lowStockFilter.set(undefined);
    } else if (value === 'true') {
      this.lowStockFilter.set(true);
    } else {
      this.lowStockFilter.set(false);
    }
    this.onFilterChange();
  }

}

