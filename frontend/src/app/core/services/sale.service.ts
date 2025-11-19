import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Sale, CreateSaleRequest } from '@core/models/sale.model';

export interface SaleListResponse {
  items: Sale[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private api = inject(ApiService);

  createSale(request: CreateSaleRequest): Observable<Sale> {
    return this.api.post<Sale>('sales', request);
  }

  getSales(filters?: {
    search?: string;
    customerId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<SaleListResponse> {
    return this.api.get<SaleListResponse>('sales', {
      params: filters,
      cache: true,
      cacheTTL: 30000,
    });
  }

  getSaleById(id: string): Observable<Sale> {
    return this.api.get<Sale>(`sales/${id}`, {
      cache: true,
      cacheTTL: 60000,
    });
  }
}

