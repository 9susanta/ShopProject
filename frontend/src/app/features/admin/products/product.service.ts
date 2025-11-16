import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    return this.api.get<Product[]>(`products/search?barcode=${encodeURIComponent(barcode)}`, {
      cache: false,
    }).pipe(
      // Map array response to single product
      map((response: Product[]) => {
        if (Array.isArray(response) && response.length > 0) {
          return response[0];
        }
        throw new Error('Product not found');
      })
    );
  }

  createProduct(product: ProductCreateRequest): Observable<Product> {
    // If image is present, use FormData, otherwise use JSON
    if (product.image) {
      const formData = this.createFormData(product);
      return this.api.postFormData<Product>('products', formData);
    } else {
      // Remove image from payload for JSON request
      const { image, ...productData } = product;
      return this.api.post<Product>('products', productData);
    }
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

