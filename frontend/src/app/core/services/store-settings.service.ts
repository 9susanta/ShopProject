import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface StoreSettings {
  id: string;
  storeName: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  packingCharges: number;
  isHomeDeliveryEnabled: boolean;
  homeDeliveryCharges: number;
  pointsPerHundredRupees: number;
}

export interface UpdateStoreSettingsRequest {
  storeName: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  packingCharges: number;
  isHomeDeliveryEnabled: boolean;
  homeDeliveryCharges: number;
  pointsPerHundredRupees: number;
}

@Injectable({
  providedIn: 'root',
})
export class StoreSettingsService {
  private api = inject(ApiService);

  getStoreSettings(): Observable<StoreSettings> {
    return this.api.get<StoreSettings>('storesettings', {
      cache: true,
      cacheTTL: 3600000, // 1 hour
    });
  }

  updateStoreSettings(request: UpdateStoreSettingsRequest): Observable<StoreSettings> {
    return this.api.put<StoreSettings>('storesettings', request);
  }
}

