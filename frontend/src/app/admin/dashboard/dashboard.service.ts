import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { DashboardData } from '../../core/models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private api: ApiService) {}

  /**
   * Get dashboard KPIs and data
   * Calls GET /admin/dashboard
   */
  getDashboardData(): Observable<DashboardData> {
    return this.api.get<DashboardData>('admin/dashboard', {
      cache: true,
      cacheKey: 'dashboard_data',
      cacheTTL: 60000, // 1 minute cache
    });
  }
}


