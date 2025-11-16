import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
   * Calls GET /products?paged=false
   */
  getProducts(): Observable<Product[]> {
    return this.api.get<Product[]>('products', {
      params: { paged: 'false' },
      cache: true,
      cacheKey: 'products_list',
      cacheTTL: 300000, // 5 minutes
    });
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


