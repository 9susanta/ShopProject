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
    // Ensure SKU is not empty (backend requires it)
    if (!product.sku || product.sku.trim() === '') {
      // Generate a default SKU from product name if not provided
      product.sku = product.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 20) || 'SKU-' + Date.now().toString().slice(-6);
    }

    // Convert camelCase to PascalCase for backend API (ASP.NET Core accepts camelCase by default, but being explicit)
    const backendRequest: any = {
      name: product.name.trim(),
      sku: product.sku.trim(),
      mrp: product.mrp,
      salePrice: product.salePrice,
      categoryId: product.categoryId,
      unitId: product.unitId,
      lowStockThreshold: product.lowStockThreshold,
    };

    // Add optional fields (only if they have values)
    if (product.barcode && product.barcode.trim()) {
      backendRequest.barcode = product.barcode.trim();
    }
    if (product.taxSlabId) {
      backendRequest.taxSlabId = product.taxSlabId;
    }
    if (product.description && product.description.trim()) {
      backendRequest.description = product.description.trim();
    }

    // Note: Image upload should be handled separately if needed
    // For now, we'll send the product data without image
    // ImageUrl can be set later via a separate endpoint if available

    return this.api.post<Product>('products', backendRequest);
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

  private createFormDataForBackend(backendRequest: any, imageFile: File): FormData {
    const formData = new FormData();
    
    // Append all backend request properties with PascalCase names
    Object.keys(backendRequest).forEach(key => {
      const value = backendRequest[key];
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Append image file
    formData.append('image', imageFile);

    return formData;
  }
}

