import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Customer, CustomerListResponse, CreateCustomerRequest, UpdateCustomerRequest } from '@core/models/customer.model';

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
}

