import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { TaxSlabDto, TaxSlabCreateRequest, TaxSlabUpdateRequest } from '@core/models/tax-slab.model';

@Injectable({
  providedIn: 'root',
})
export class TaxSlabService {
  private api = inject(ApiService);

  /**
   * Get all tax slabs
   */
  getTaxSlabs(isActive: boolean = true): Observable<TaxSlabDto[]> {
    return this.api.get<TaxSlabDto[]>('taxSlabs', {
      params: { isActive },
      cache: true,
      cacheKey: `taxSlabs_${isActive}`,
      cacheTTL: 600000, // 10 minutes
    });
  }

  /**
   * Create a new tax slab
   */
  createTaxSlab(taxSlab: TaxSlabCreateRequest): Observable<TaxSlabDto> {
    return this.api.post<TaxSlabDto>('taxSlabs', taxSlab);
  }

  /**
   * Update a tax slab
   */
  updateTaxSlab(taxSlab: TaxSlabUpdateRequest): Observable<TaxSlabDto> {
    return this.api.put<TaxSlabDto>(`taxSlabs/${taxSlab.id}`, taxSlab);
  }
}

