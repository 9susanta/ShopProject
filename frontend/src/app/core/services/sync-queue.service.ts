import { Injectable, inject } from '@angular/core';
import { Observable, from, of, EMPTY } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { OfflineStorageService } from './offline-storage.service';
import { SaleService } from './sale.service';
import { ToastService } from '@core/toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class SyncQueueService {
  private offlineStorage = inject(OfflineStorageService);
  private saleService = inject(SaleService);
  private toastService = inject(ToastService);
  private isSyncing = false;

  async syncPendingSales(): Promise<void> {
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    try {
      const unsyncedSales = await this.offlineStorage.getUnsyncedSales();
      
      for (const offlineSale of unsyncedSales) {
        try {
          await this.saleService.createSale(offlineSale.saleData).toPromise();
          await this.offlineStorage.markAsSynced(offlineSale.id);
        } catch (error) {
          console.error(`Failed to sync sale ${offlineSale.id}:`, error);
          // Continue with next sale
        }
      }

      if (unsyncedSales.length > 0) {
        this.toastService.success(`Synced ${unsyncedSales.length} offline sale(s)`);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  async addToQueue(saleData: any): Promise<string> {
    return await this.offlineStorage.saveOfflineSale(saleData);
  }
}



