import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/api/api.service';
import { UnitDto } from '@core/models/unit.model';

@Injectable({
  providedIn: 'root',
})
export class UnitService {
  private api = inject(ApiService);

  /**
   * Get all units
   */
  getUnits(isActive: boolean = true): Observable<UnitDto[]> {
    return this.api.get<UnitDto[]>('units', {
      params: { isActive },
      cache: true,
      cacheKey: `units_${isActive}`,
      cacheTTL: 600000, // 10 minutes
    });
  }
}

