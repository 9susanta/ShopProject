import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/api/api.service';
import { TaxSlabDto, TaxSlabCreateRequest, TaxSlabUpdateRequest } from '@core/models/taxslab.model';

@Injectable({
  providedIn: 'root',
})
export class TaxSlabService {
  private api = inject(ApiService);

  /**
   * Get all tax slabs
   */
  getTaxSlabs(isActive: boolean = true): Observable<TaxSlabDto[]> {
    return this.api.get<TaxSlabDto[]>('taxslabs', {
      params: { isActive },
      cache: true,
      cacheKey: `taxslabs_${isActive}`,
      cacheTTL: 600000, // 10 minutes
    });
  }

  /**
   * Create a new tax slab
   */
  createTaxSlab(taxSlab: TaxSlabCreateRequest): Observable<TaxSlabDto> {
    return this.api.post<TaxSlabDto>('taxslabs', taxSlab);
  }

  /**
   * Update a tax slab
   */
  updateTaxSlab(taxSlab: TaxSlabUpdateRequest): Observable<TaxSlabDto> {
    return this.api.put<TaxSlabDto>(`taxslabs/${taxSlab.id}`, taxSlab);
  }
}

