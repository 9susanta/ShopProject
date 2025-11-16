import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { DashboardData, DashboardDto, RecentImport } from '../../core/models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private api: ApiService) {}

  /**
   * Get dashboard KPIs and data
   * Calls GET /admin/dashboard
   * Maps backend DTO to frontend model
   */
  getDashboardData(): Observable<DashboardData> {
    return this.api.get<DashboardDto>('admin/dashboard', {
      cache: true,
      cacheKey: 'dashboard_data',
      cacheTTL: 60000, // 1 minute cache
    }).pipe(
      map((dto) => this.mapDtoToModel(dto))
    );
  }

  /**
   * Map backend DTO to frontend model structure
   */
  private mapDtoToModel(dto: DashboardDto): DashboardData {
    // Map recent imports
    const recentImports: RecentImport[] = (dto.recentImports || []).map(imp => ({
      id: imp.id,
      fileName: imp.fileName,
      status: imp.status,
      createdAt: imp.createdAt,
      totalRows: imp.totalRows,
      successRows: imp.successfulRows || imp.processedRows || 0
    }));

    return {
      kpis: {
        todaySales: dto.todaySales || 0,
        monthSales: dto.totalSalesThisMonth || 0,
        lowStockCount: dto.lowStockCount || 0,
        totalProducts: 0, // Not provided by backend, will need separate API call
        totalCategories: 0 // Not provided by backend, will need separate API call
      },
      recentImports: recentImports,
      lowStockProducts: [] // Not provided by backend in current DTO, will need separate API call
    };
  }
}


