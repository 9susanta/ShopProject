import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/api/api.service';
import { Inventory, InventoryListResponse, InventoryFilters, InventoryAdjustRequest } from '@core/models/inventory.model';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private api = inject(ApiService);

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
}

