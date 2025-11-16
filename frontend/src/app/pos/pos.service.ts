import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
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
   * Calls GET /products/barcode/{barcode}
   */
  getProductByBarcode(barcode: string): Observable<Product> {
    return this.api.get<Product>(`products/barcode/${encodeURIComponent(barcode)}`, {
      cache: false,
    });
  }

  /**
   * Create sale
   * Calls POST /sales
   */
  createSale(saleRequest: SaleRequest): Observable<SaleResponse> {
    return this.api.post<SaleResponse>('sales', saleRequest);
  }
}


