import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Offer, CreateOfferRequest, UpdateOfferRequest } from '@core/models/offer.model';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  private api = inject(ApiService);

  getOffers(filters?: {
    isActive?: boolean;
    isValid?: boolean;
    productId?: string;
    categoryId?: string;
  }): Observable<Offer[]> {
    return this.api.get<Offer[]>('offers', {
      params: filters,
      cache: true,
      cacheTTL: 30000,
    });
  }

  getOfferById(id: string): Observable<Offer> {
    return this.api.get<Offer>(`offers/${id}`, {
      cache: true,
      cacheTTL: 60000,
    });
  }

  createOffer(request: CreateOfferRequest): Observable<Offer> {
    return this.api.post<Offer>('offers', request);
  }

  updateOffer(request: UpdateOfferRequest): Observable<Offer> {
    return this.api.put<Offer>(`offers/${request.id}`, request);
  }

  deleteOffer(id: string): Observable<void> {
    return this.api.delete<void>(`offers/${id}`);
  }
}

