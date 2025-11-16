import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Sale, CreateSaleRequest } from '@core/models/sale.model';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private api = inject(ApiService);

  createSale(request: CreateSaleRequest): Observable<Sale> {
    return this.api.post<Sale>('sales', request);
  }

  getSaleById(id: string): Observable<Sale> {
    return this.api.get<Sale>(`sales/${id}`);
  }
}

