import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

export interface SaleReturn {
  id: string;
  returnNumber: string;
  saleId: string;
  saleInvoiceNumber: string;
  returnDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Refunded' | 'Cancelled';
  statusName: string;
  totalRefundAmount: number;
  notes?: string;
  processedByUserId?: string;
  processedByUserName?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt?: string;
  items: SaleReturnItem[];
  refund?: Refund;
}

export interface SaleReturnItem {
  id: string;
  saleItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalRefundAmount: number;
  reason: string;
}

export interface Refund {
  id: string;
  saleReturnId: string;
  amount: number;
  paymentMethod: string;
  paymentMethodName: string;
  status: 'Pending' | 'Processed' | 'Failed';
  statusName: string;
  transactionId?: string;
  referenceNumber?: string;
  processedAt?: string;
  processedByUserId?: string;
  processedByUserName?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSaleReturnRequest {
  saleId: string;
  returnDate: string;
  reason: string;
  notes?: string;
  items: SaleReturnItemRequest[];
}

export interface SaleReturnItemRequest {
  saleItemId: string;
  quantity: number;
  unitPrice: number;
  reason: string;
}

export interface ProcessRefundRequest {
  saleReturnId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  referenceNumber?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SaleReturnService {
  private api = inject(ApiService);

  /**
   * Create a sale return
   */
  createSaleReturn(saleId: string, request: CreateSaleReturnRequest): Observable<SaleReturn> {
    return this.api.post<SaleReturn>(`sales/${saleId}/returns`, request);
  }

  /**
   * Process refund for a sale return
   */
  processRefund(returnId: string, request: ProcessRefundRequest): Observable<Refund> {
    return this.api.post<Refund>(`sales/returns/${returnId}/refund`, request);
  }

  /**
   * Get list of sale returns
   */
  getSaleReturns(params?: {
    saleId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<SaleReturn[]> {
    return this.api.get<SaleReturn[]>('sales/returns', { params });
  }

  /**
   * Get sale return by ID
   */
  getSaleReturnById(id: string): Observable<SaleReturn> {
    return this.api.get<SaleReturn>(`sales/returns/${id}`);
  }
}

