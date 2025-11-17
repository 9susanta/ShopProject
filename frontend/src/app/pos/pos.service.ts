import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../core/api/api.service';
import { Product, Category, SaleRequest, SaleResponse } from '../core/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class PosService {
  constructor(private api: ApiService) {}

  /**
   * Get all products (cached)
   * Calls GET /products with large page size to get all registered products
   * Note: Backend defaults to active products only, so we fetch both active and inactive
   */
  getProducts(): Observable<Product[]> {
    // Fetch both active and inactive products, then combine them
    const activeProducts$ = this.api.get<any>('products', {
      params: { 
        pageSize: 10000,
        pageNumber: 1,
        isActive: true,
      },
      cache: true,
      cacheKey: 'pos_products_active',
      cacheTTL: 300000,
    });

    const inactiveProducts$ = this.api.get<any>('products', {
      params: { 
        pageSize: 10000,
        pageNumber: 1,
        isActive: false,
      },
      cache: true,
      cacheKey: 'pos_products_inactive',
      cacheTTL: 300000,
    });

    // Combine both requests using forkJoin
    return forkJoin([activeProducts$, inactiveProducts$]).pipe(
      map(([activeResponse, inactiveResponse]) => {
        const activeItems = activeResponse?.items || (Array.isArray(activeResponse) ? activeResponse : []);
        const inactiveItems = inactiveResponse?.items || (Array.isArray(inactiveResponse) ? inactiveResponse : []);
        
        // Combine and deduplicate by product ID
        const allProducts = [...activeItems, ...inactiveItems];
        const uniqueProducts = allProducts.filter((product, index, self) => 
          index === self.findIndex((p) => p.id === product.id)
        );
        
        return uniqueProducts;
      })
    );
  }

  /**
   * Search products
   * Calls GET /products?search={term}
   */
  searchProducts(searchTerm: string): Observable<Product[]> {
    return this.api.get<Product[]>('products', {
      params: { search: searchTerm },
      cache: false,
    });
  }

  /**
   * Get categories (cached)
   * Calls GET /categories
   */
  getCategories(): Observable<Category[]> {
    return this.api.get<Category[]>('categories', {
      cache: true,
      cacheKey: 'categories_list',
      cacheTTL: 600000, // 10 minutes
    });
  }

  /**
   * Get product by barcode
   * Calls GET /products/search?barcode={barcode}
   */
  getProductByBarcode(barcode: string): Observable<Product> {
    return this.api.get<Product[]>('products/search', {
      params: { barcode: barcode },
      cache: false,
    }).pipe(
      map(products => {
        if (products && products.length > 0) {
          return products[0]; // Return first matching product
        }
        throw new Error('Product not found');
      })
    );
  }

  /**
   * Create sale
   * Calls POST /sales
   */
  createSale(saleRequest: SaleRequest): Observable<SaleResponse> {
    return this.api.post<SaleResponse>('sales', saleRequest);
  }
}


