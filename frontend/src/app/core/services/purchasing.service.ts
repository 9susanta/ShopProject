import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  PurchaseOrder,
  PurchaseOrderListResponse,
  PurchaseOrderFilters,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  GoodsReceiveNote,
  GRNListResponse,
  GRNFilters,
  CreateGRNRequest,
  ConfirmGRNRequest,
  ConfirmGRNResponse,
  Supplier,
  SupplierListResponse,
  SupplierReturn,
  CreateSupplierReturnRequest,
} from '@core/models/purchasing.model';

@Injectable({
  providedIn: 'root',
})
export class PurchasingService {
  private api = inject(ApiService);

  // Purchase Order endpoints
  getPurchaseOrders(filters?: PurchaseOrderFilters): Observable<PurchaseOrderListResponse> {
    return this.api.get<PurchaseOrderListResponse>('purchasing/purchase-orders', {
      params: filters,
      cache: true,
      cacheTTL: 30000, // 30 seconds
    });
  }

  getPurchaseOrderById(id: string): Observable<PurchaseOrder> {
    return this.api.get<PurchaseOrder>(`purchasing/purchase-orders/${id}`, {
      cache: true,
      cacheTTL: 60000,
    });
  }

  createPurchaseOrder(request: CreatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.api.post<PurchaseOrder>('purchasing/purchase-orders', request);
  }

  updatePurchaseOrder(id: string, request: UpdatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.api.put<PurchaseOrder>(`purchasing/purchase-orders/${id}`, request);
  }

  approvePurchaseOrder(id: string): Observable<void> {
    return this.api.post<void>(`purchasing/purchase-orders/${id}/approve`, {});
  }

  cancelPurchaseOrder(id: string): Observable<void> {
    return this.api.post<void>(`purchasing/purchase-orders/${id}/cancel`, {});
  }

  // GRN endpoints
  getGRNs(filters?: GRNFilters): Observable<GRNListResponse> {
    return this.api.get<GRNListResponse>('purchasing/grn', {
      params: filters,
      cache: true,
      cacheTTL: 30000,
    });
  }

  getGRNById(id: string): Observable<GoodsReceiveNote> {
    return this.api.get<GoodsReceiveNote>(`purchasing/grn/${id}`, {
      cache: true,
      cacheTTL: 60000,
    });
  }

  createGRN(request: CreateGRNRequest): Observable<GoodsReceiveNote> {
    return this.api.post<GoodsReceiveNote>('purchasing/grn', request);
  }

  confirmGRN(id: string, request?: ConfirmGRNRequest): Observable<ConfirmGRNResponse> {
    return this.api.post<ConfirmGRNResponse>(`purchasing/grn/${id}/confirm`, request || {});
  }

  cancelGRN(id: string): Observable<void> {
    return this.api.post<void>(`purchasing/grn/${id}/cancel`, {});
  }

  uploadInvoice(file: File): Observable<{ filePath: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<{ filePath: string; fileUrl: string }>(
      'purchasing/grn/upload-invoice',
      formData
    );
  }

  returnToSupplier(grnId: string, items: Array<{ batchId: string; quantity: number }>): Observable<void> {
    return this.api.post<void>(`purchasing/grn/${grnId}/return-to-supplier`, { items });
  }

  // Supplier endpoints
  getSuppliers(): Observable<SupplierListResponse> {
    return this.api.get<SupplierListResponse>('master/suppliers', {
      cache: true,
      cacheTTL: 300000, // 5 minutes
    });
  }

  getSupplierById(id: string): Observable<Supplier> {
    return this.api.get<Supplier>(`master/suppliers/${id}`, {
      cache: true,
      cacheTTL: 300000,
    });
  }

  createSupplier(supplier: Partial<Supplier>): Observable<Supplier> {
    return this.api.post<Supplier>('master/suppliers', supplier);
  }

  // Supplier Return endpoints
  getSupplierReturns(params?: {
    supplierId?: string;
    grnId?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<SupplierReturn[]> {
    return this.api.get<SupplierReturn[]>('purchasing/supplier-returns', { params });
  }

  getSupplierReturnById(id: string): Observable<SupplierReturn> {
    return this.api.get<SupplierReturn>(`purchasing/supplier-returns/${id}`);
  }

  createSupplierReturn(request: CreateSupplierReturnRequest): Observable<SupplierReturn> {
    return this.api.post<SupplierReturn>('purchasing/supplier-returns', request);
  }
}

