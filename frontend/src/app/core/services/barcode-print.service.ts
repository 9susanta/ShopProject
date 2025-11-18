import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BarcodePrintService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/print`;

  printBarcode(productId: string, quantity: number = 1): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/barcode`, {
      productId,
      quantity,
    });
  }
}

