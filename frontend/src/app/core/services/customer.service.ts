import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import {
  Customer,
  CustomerListResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerSavedItem,
  PayLaterLedgerEntry,
  PayLaterBalance,
} from '@core/models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private api = inject(ApiService);

  getCustomers(filters?: {
    search?: string;
    isActive?: boolean;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<CustomerListResponse> {
    return this.api.get<CustomerListResponse>('customers', {
      params: filters,
      cache: true,
      cacheTTL: 30000,
    });
  }

  getCustomerById(id: string): Observable<Customer> {
    return this.api.get<Customer>(`customers/${id}`, {
      cache: true,
      cacheTTL: 60000,
    });
  }

  getCustomerByPhone(phone: string): Observable<Customer> {
    return this.api.get<Customer>(`customers/by-phone/${phone}`, {
      cache: true,
      cacheTTL: 60000,
    });
  }

  createCustomer(request: CreateCustomerRequest): Observable<Customer> {
    return this.api.post<Customer>('customers', request);
  }

  updateCustomer(request: UpdateCustomerRequest): Observable<Customer> {
    return this.api.put<Customer>(`customers/${request.id}`, request);
  }

  getCustomerPurchaseHistory(
    customerId: string,
    filters?: {
      pageNumber?: number;
      pageSize?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Observable<any> {
    return this.api.get<any>(`customers/${customerId}/purchase-history`, {
      params: filters,
    });
  }

  getCustomerPayLaterLedger(
    customerId: string,
    filters?: {
      pageNumber?: number;
      pageSize?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Observable<{ items: PayLaterLedgerEntry[]; totalCount: number; pageNumber: number; pageSize: number }> {
    return this.api.get<{ items: PayLaterLedgerEntry[]; totalCount: number; pageNumber: number; pageSize: number }>(
      `customers/${customerId}/pay-later-ledger`,
      { params: filters }
    );
  }

  getCustomerSavedItems(
    customerId: string,
    filters?: {
      isFavorite?: boolean;
      pageNumber?: number;
      pageSize?: number;
    }
  ): Observable<{ items: CustomerSavedItem[]; totalCount: number; pageNumber: number; pageSize: number }> {
    return this.api.get<{ items: CustomerSavedItem[]; totalCount: number; pageNumber: number; pageSize: number }>(
      `customers/${customerId}/saved-items`,
      { params: filters }
    );
  }

  addCustomerSavedItem(customerId: string, productId: string, isFavorite: boolean = false): Observable<CustomerSavedItem> {
    return this.api.post<CustomerSavedItem>(`customers/${customerId}/saved-items`, {
      customerId,
      productId,
      isFavorite,
    });
  }

  updateCustomerPayLaterSettings(
    customerId: string,
    settings: { isPayLaterEnabled: boolean; payLaterLimit?: number }
  ): Observable<Customer> {
    return this.api.put<Customer>(`customers/${customerId}/pay-later-settings`, {
      customerId,
      ...settings,
    });
  }

  recordPayLaterPayment(
    customerId: string,
    payment: { amount: number; description?: string; paymentReference?: string }
  ): Observable<PayLaterLedgerEntry> {
    return this.api.post<PayLaterLedgerEntry>(`customers/${customerId}/pay-later-payment`, {
      customerId,
      ...payment,
    });
  }

  getPayLaterBalance(customerId: string): Observable<PayLaterBalance> {
    return this.api.get<PayLaterBalance>(`customers/${customerId}/pay-later-balance`);
  }
}

