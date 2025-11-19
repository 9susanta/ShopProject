import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '@core/services/api.service';
import { DashboardData, DashboardDto, RecentImport } from '@core/models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private api: ApiService) {}

  getDashboardData(): Observable<DashboardData> {
    return this.api.get<DashboardDto>('admin/dashboard', {
      cache: true,
      cacheKey: 'dashboard_data',
      cacheTTL: 60000,
    }).pipe(
      map((dto) => this.mapDtoToModel(dto))
    );
  }

  private mapDtoToModel(dto: DashboardDto): DashboardData {
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
        totalProducts: 0,
        totalCategories: 0
      },
      recentImports: recentImports,
      lowStockProducts: []
    };
  }
}

