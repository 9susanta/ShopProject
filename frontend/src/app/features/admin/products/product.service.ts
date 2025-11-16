import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/api/api.service';
import {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductListResponse,
  ProductFilters,
} from '@core/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private api = inject(ApiService);

  getProducts(filters?: ProductFilters): Observable<ProductListResponse> {
    // Filter out undefined/null values to avoid sending "undefined" as query params
    const cleanFilters: any = {};
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== 'undefined') {
          cleanFilters[key] = value;
        }
      });
    }
    
    return this.api.get<ProductListResponse>('products', {
      params: cleanFilters,
      cache: true,
      cacheKey: `products_${JSON.stringify(cleanFilters)}`,
      cacheTTL: 60000,
    });
  }

  getProductById(id: string): Observable<Product> {
    return this.api.get<Product>(`products/${id}`, {
      cache: true,
      cacheKey: `product_${id}`,
      cacheTTL: 300000,
    });
  }

  getProductByBarcode(barcode: string): Observable<Product> {
    return this.api.get<Product>(`products/by-barcode/${encodeURIComponent(barcode)}`, {
      cache: false,
    });
  }

  createProduct(product: ProductCreateRequest): Observable<Product> {
    return this.api.post<Product>('admin/products', this.createFormData(product));
  }

  updateProduct(product: ProductUpdateRequest): Observable<Product> {
    return this.api.put<Product>(`admin/products/${product.id}`, this.createFormData(product));
  }

  deleteProduct(id: string): Observable<void> {
    return this.api.delete<void>(`admin/products/${id}`);
  }

  private createFormData(product: ProductCreateRequest | ProductUpdateRequest): FormData {
    const formData = new FormData();
    
    Object.keys(product).forEach(key => {
      const value = (product as any)[key];
      if (value !== null && value !== undefined) {
        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else if (typeof value === 'object' && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return formData;
  }
}

