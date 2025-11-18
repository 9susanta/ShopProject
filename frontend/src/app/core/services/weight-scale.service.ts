import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WeightReading {
  weight: number;
  unit: string;
  timestamp: string;
}

export interface ScaleStatus {
  isConnected: boolean;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class WeightScaleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/weight-scale`;

  readWeight(): Observable<WeightReading> {
    return this.http.get<WeightReading>(`${this.apiUrl}/read`);
  }

  tare(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/tare`, {});
  }

  getStatus(): Observable<ScaleStatus> {
    return this.http.get<ScaleStatus>(`${this.apiUrl}/status`);
  }

  connect(port?: string): Observable<{ success: boolean; message: string }> {
    const url = port ? `${this.apiUrl}/connect?port=${port}` : `${this.apiUrl}/connect`;
    return this.http.post<{ success: boolean; message: string }>(url, {});
  }

  disconnect(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/disconnect`, {});
  }
}

