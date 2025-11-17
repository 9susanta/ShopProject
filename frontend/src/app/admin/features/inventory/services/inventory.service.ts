import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Inventory, InventoryListResponse, InventoryFilters, InventoryAdjustRequest } from '@core/models/inventory.model';
import {
  ProductInventory,
  ProductInventoryListResponse,
  LowStockProduct,
  LowStockListResponse,
  ExpirySoonBatch,
  ExpirySoonListResponse,
  StockValuation,
  InventoryAdjustment,
  AdjustmentListResponse,
  AdjustmentFilters,
  CreateAdjustmentRequest,
} from '@core/models/inventory-batch.model';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private api = inject(ApiService);

  // Inventory endpoints
  getInventories(filters?: InventoryFilters): Observable<InventoryListResponse> {
    return this.api.get<InventoryListResponse>('inventory', {
      params: filters,
      cache: true,
      cacheTTL: 30000,
    });
  }

  adjustInventory(request: InventoryAdjustRequest): Observable<void> {
    return this.api.post<void>('inventory/adjust', request);
  }

  // New inventory endpoints
  getProducts(filters?: {
    categoryId?: string;
    lowStock?: boolean;
    expirySoon?: boolean;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<ProductInventoryListResponse> {
    return this.api.get<ProductInventoryListResponse>('inventory/products', {
      params: filters,
      cache: true,
      cacheTTL: 30000,
    });
  }

  getProductById(id: string): Observable<ProductInventory> {
    return this.api.get<ProductInventory>(`inventory/product/${id}`, {
      cache: true,
      cacheTTL: 60000,
    });
  }

  getLowStock(daysAhead?: number): Observable<LowStockListResponse> {
    return this.api.get<LowStockListResponse>('inventory/low-stock', {
      params: daysAhead ? { daysAhead } : undefined,
      cache: true,
      cacheTTL: 60000,
    });
  }

  getExpirySoon(daysAhead: number = 7): Observable<ExpirySoonListResponse> {
    return this.api.get<ExpirySoonListResponse>('inventory/expiry-soon', {
      params: { daysAhead },
      cache: true,
      cacheTTL: 60000,
    });
  }

  getValuation(method: 'FIFO' | 'LIFO' | 'WeightedAverage' = 'FIFO'): Observable<StockValuation> {
    return this.api.get<StockValuation>('inventory/valuation', {
      params: { method },
      cache: true,
      cacheTTL: 60000,
    });
  }

  createAdjustment(request: CreateAdjustmentRequest): Observable<InventoryAdjustment> {
    return this.api.post<InventoryAdjustment>('inventory/adjustment', request);
  }

  getAdjustments(filters?: AdjustmentFilters): Observable<AdjustmentListResponse> {
    return this.api.get<AdjustmentListResponse>('inventory/adjustments', {
      params: filters,
      cache: true,
      cacheTTL: 30000,
    });
  }

  // Get product by barcode
  getProductByBarcode(barcode: string): Observable<ProductInventory> {
    return this.api.get<ProductInventory>(`products/by-barcode/${barcode}`, {
      cache: true,
      cacheTTL: 300000,
    });
  }
}

