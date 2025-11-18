import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupplierPayment, OutstandingPayment, CreateSupplierPaymentRequest } from '@core/models/supplier-payment.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierPaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/suppliers`;

  createPayment(supplierId: string, request: CreateSupplierPaymentRequest): Observable<SupplierPayment> {
    return this.http.post<SupplierPayment>(`${this.apiUrl}/${supplierId}/payments`, request);
  }

  getOutstandingPayments(supplierId?: string): Observable<OutstandingPayment[]> {
    let params = new HttpParams();
    if (supplierId) {
      params = params.set('supplierId', supplierId);
    }
    return this.http.get<OutstandingPayment[]>(`${this.apiUrl}/outstanding`, { params });
  }

  getSupplierPayments(supplierId: string, startDate?: string, endDate?: string): Observable<SupplierPayment[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<SupplierPayment[]>(`${this.apiUrl}/${supplierId}/payments`, { params });
  }
}

