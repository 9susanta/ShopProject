import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineSale {
  id: string;
  saleData: any;
  createdAt: string;
  synced: boolean;
}

interface AppDB extends DBSchema {
  offlineSales: {
    key: string;
    value: OfflineSale;
    indexes: { 'by-synced': boolean; 'by-created': string };
  };
}

@Injectable({
  providedIn: 'root',
})
export class OfflineStorageService {
  private dbName = 'GroceryStoreDB';
  private dbVersion = 1;
  private db: IDBPDatabase<AppDB> | null = null;

  async init(): Promise<void> {
    if (!this.db) {
      this.db = await openDB<AppDB>(this.dbName, this.dbVersion, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('offlineSales')) {
            const store = db.createObjectStore('offlineSales', { keyPath: 'id' });
            store.createIndex('by-synced', 'synced');
            store.createIndex('by-created', 'createdAt');
          }
        },
      });
    }
  }

  async saveOfflineSale(saleData: any): Promise<string> {
    await this.init();
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineSale: OfflineSale = {
      id,
      saleData,
      createdAt: new Date().toISOString(),
      synced: false,
    };
    await this.db!.put('offlineSales', offlineSale);
    return id;
  }

  async getUnsyncedSales(): Promise<OfflineSale[]> {
    await this.init();
    const index = this.db!.transaction('offlineSales').store.index('by-synced');
    return await index.getAll(false);
  }

  async markAsSynced(id: string): Promise<void> {
    await this.init();
    const sale = await this.db!.get('offlineSales', id);
    if (sale) {
      sale.synced = true;
      await this.db!.put('offlineSales', sale);
    }
  }

  async deleteSale(id: string): Promise<void> {
    await this.init();
    await this.db!.delete('offlineSales', id);
  }

  async clearAll(): Promise<void> {
    await this.init();
    await this.db!.clear('offlineSales');
  }
}



