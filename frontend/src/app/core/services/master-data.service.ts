import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, shareReplay, catchError } from 'rxjs/operators';
import { CategoryService } from './category.service';
import { TaxSlabService } from './tax-slab.service';
import { UnitService } from './unit.service';
import { CategoryDto } from '@core/models/category.model';
import { TaxSlabDto } from '@core/models/tax-slab.model';
import { UnitDto } from '@core/models/unit.model';

interface MasterDataCache {
  categories: CategoryDto[];
  taxSlabs: TaxSlabDto[];
  units: UnitDto[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class MasterDataService {
  private categoryService = inject(CategoryService);
  private TaxSlabService = inject(TaxSlabService);
  private unitService = inject(UnitService);

  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private cache: MasterDataCache | null = null;

  // Signals for reactive updates
  categories = signal<CategoryDto[]>([]);
  taxSlabs = signal<TaxSlabDto[]>([]);
  units = signal<UnitDto[]>([]);
  isLoading = signal(false);

  /**
   * Get all categories (cached)
   */
  getCategories(forceRefresh = false): Observable<CategoryDto[]> {
    if (!forceRefresh && this.isCacheValid('categories')) {
      return of(this.cache!.categories);
    }

    this.isLoading.set(true);
    return this.categoryService.getCategories().pipe(
      tap(categories => {
        this.updateCache('categories', categories);
        this.categories.set(categories);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        // Return cached data on error if available
        if (this.cache?.categories) {
          return of(this.cache.categories);
        }
        throw error;
      }),
      shareReplay(1)
    );
  }

  /**
   * Get all tax slabs (cached)
   */
  getTaxSlabs(forceRefresh = false): Observable<TaxSlabDto[]> {
    if (!forceRefresh && this.isCacheValid('taxSlabs')) {
      return of(this.cache!.taxSlabs);
    }

    this.isLoading.set(true);
    return this.TaxSlabService.getTaxSlabs().pipe(
      tap(taxSlabs => {
        this.updateCache('taxSlabs', taxSlabs);
        this.taxSlabs.set(taxSlabs);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        if (this.cache?.taxSlabs) {
          return of(this.cache.taxSlabs);
        }
        throw error;
      }),
      shareReplay(1)
    );
  }

  /**
   * Get all units (cached)
   */
  getUnits(forceRefresh = false): Observable<UnitDto[]> {
    if (!forceRefresh && this.isCacheValid('units')) {
      return of(this.cache!.units);
    }

    this.isLoading.set(true);
    return this.unitService.getUnits().pipe(
      tap(units => {
        this.updateCache('units', units);
        this.units.set(units);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        if (this.cache?.units) {
          return of(this.cache.units);
        }
        throw error;
      }),
      shareReplay(1)
    );
  }

  /**
   * Refresh all master data
   */
  refreshAll(): Observable<[CategoryDto[], TaxSlabDto[], UnitDto[]]> {
    return new Observable(observer => {
      this.getCategories(true).subscribe({
        next: categories => {
          this.getTaxSlabs(true).subscribe({
            next: taxSlabs => {
              this.getUnits(true).subscribe({
                next: units => {
                  observer.next([categories, taxSlabs, units]);
                  observer.complete();
                },
                error: observer.error,
              });
            },
            error: observer.error,
          });
        },
        error: observer.error,
      });
    });
  }

  /**
   * Add a new category to cache (after creation)
   */
  addCategoryToCache(category: CategoryDto): void {
    const current = this.categories();
    this.categories.set([...current, category]);
    this.updateCache('categories', this.categories());
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = null;
    this.categories.set([]);
    this.taxSlabs.set([]);
    this.units.set([]);
  }

  private isCacheValid(key: keyof Omit<MasterDataCache, 'timestamp'>): boolean {
    if (!this.cache) return false;
    const now = Date.now();
    return now - this.cache.timestamp < this.CACHE_TTL;
  }

  private updateCache(key: keyof Omit<MasterDataCache, 'timestamp'>, data: any): void {
    if (!this.cache) {
      this.cache = {
        categories: [],
        taxSlabs: [],
        units: [],
        timestamp: Date.now(),
      };
    }
    this.cache[key] = data;
    this.cache.timestamp = Date.now();
  }
}

