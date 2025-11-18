import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GSTExportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/gst`;

  exportGSTR1(fromDate: string, toDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);
    return this.http.get(`${this.apiUrl}/gstr1`, { params, responseType: 'blob' });
  }

  exportGSTR2(fromDate: string, toDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);
    return this.http.get(`${this.apiUrl}/gstr2`, { params, responseType: 'blob' });
  }
}

