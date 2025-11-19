import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Supplier,
  SupplierListResponse,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from '@core/models/supplier.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private api = inject(ApiService);

  getSuppliers(filters?: {
    search?: string;
    isActive?: boolean;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<SupplierListResponse> {
    return this.api.get<SupplierListResponse>('master/suppliers', {
      params: filters,
      cache: true,
      cacheTTL: 30000,
    });
  }

  getSupplierById(id: string): Observable<Supplier> {
    return this.api.get<Supplier>(`master/suppliers/${id}`, {
      cache: true,
      cacheTTL: 60000,
    });
  }

  createSupplier(request: CreateSupplierRequest): Observable<Supplier> {
    return this.api.post<Supplier>('master/suppliers', request);
  }

  updateSupplier(request: UpdateSupplierRequest): Observable<Supplier> {
    return this.api.put<Supplier>(`master/suppliers/${request.id}`, request);
  }
}

