import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReceiptPrinterService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/print`;

  printReceipt(saleId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/receipt/${saleId}`,
      {}
    );
  }
}

