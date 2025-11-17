import { Injectable, inject } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface ImportProgressEvent {
  jobId: string;
  progress: number;
  processedRows: number;
  totalRows: number;
  status: string;
  errors?: string[];
}

export interface LowStockAlertEvent {
  productId: string;
  productName: string;
  productSKU: string;
  currentStock: number;
  threshold: number;
}

export interface GRNCompletedEvent {
  grnId: string;
  grnNumber: string;
  supplierName: string;
  totalAmount: number;
  itemsReceived: number;
}

export interface ExpiryAlertEvent {
  batchId: string;
  productId: string;
  productName: string;
  productSKU: string;
  batchNumber: string;
  expiryDate: string;
  daysUntilExpiry: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  private connectionStateSubject = new Subject<HubConnectionState>();
  private importProgressSubject = new Subject<ImportProgressEvent>();
  private lowStockAlertSubject = new Subject<LowStockAlertEvent>();
  private grnCompletedSubject = new Subject<GRNCompletedEvent>();
  private expiryAlertSubject = new Subject<ExpiryAlertEvent>();
  private authService = inject(AuthService);
  
  // Flags to prevent concurrent start/stop operations
  private isStarting = false;
  private isStopping = false;

  // Hub connections for different hubs
  private importHubConnection: HubConnection | null = null;
  private inventoryHubConnection: HubConnection | null = null;

  public connectionState$ = this.connectionStateSubject.asObservable();
  public importProgress$ = this.importProgressSubject.asObservable();
  public lowStockAlert$ = this.lowStockAlertSubject.asObservable();
  public grnCompleted$ = this.grnCompletedSubject.asObservable();
  public expiryAlert$ = this.expiryAlertSubject.asObservable();

  constructor() {
    if (environment.enableSignalR) {
      this.initializeConnections();
    }
  }

  /**
   * Initialize SignalR hub connections (import and inventory)
   */
  private initializeConnections(): void {
    if (!environment.enableSignalR) {
      return;
    }

    // Initialize import progress hub (existing)
    this.initializeImportHub();
    
    // Initialize inventory hub
    this.initializeInventoryHub();
  }

  /**
   * Initialize Import Progress Hub
   */
  private initializeImportHub(): void {
    const importHubUrl = environment.signalRHub || 'http://localhost:5120/hubs/import-progress';
    
    this.importHubConnection = new HubConnectionBuilder()
      .withUrl(importHubUrl, {
        accessTokenFactory: () => {
          return this.authService.getAccessToken() || '';
        },
        withCredentials: false
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(environment.production ? LogLevel.Error : LogLevel.Warning)
      .build();

    this.setupImportHubHandlers();
  }

  /**
   * Initialize Inventory Hub
   */
  private initializeInventoryHub(): void {
    const baseUrl = environment.apiUrl.replace('/api', '');
    const inventoryHubUrl = `${baseUrl}/hubs/inventory`;
    
    this.inventoryHubConnection = new HubConnectionBuilder()
      .withUrl(inventoryHubUrl, {
        accessTokenFactory: () => {
          return this.authService.getAccessToken() || '';
        },
        withCredentials: false
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(environment.production ? LogLevel.Error : LogLevel.Warning)
      .build();

    this.setupInventoryHubHandlers();
  }

  /**
   * Setup Import Hub event handlers
   */
  private setupImportHubHandlers(): void {
    if (!this.importHubConnection) {
      return;
    }

    // Import progress event
    this.importHubConnection.on('ImportProgressUpdated', (event: ImportProgressEvent) => {
      if (!environment.production) {
        console.log('Import progress updated:', event);
      }
      this.importProgressSubject.next(event);
    });
  }

  /**
   * Setup Inventory Hub event handlers
   */
  private setupInventoryHubHandlers(): void {
    if (!this.inventoryHubConnection) {
      return;
    }

    // Low stock alert
    this.inventoryHubConnection.on('LowStockAlert', (event: LowStockAlertEvent) => {
      if (!environment.production) {
        console.log('Low stock alert:', event);
      }
      this.lowStockAlertSubject.next(event);
    });

    // GRN completed
    this.inventoryHubConnection.on('GRNCompleted', (event: GRNCompletedEvent) => {
      if (!environment.production) {
        console.log('GRN completed:', event);
      }
      this.grnCompletedSubject.next(event);
    });

    // Expiry alert
    this.inventoryHubConnection.on('ExpiryAlert', (event: ExpiryAlertEvent) => {
      if (!environment.production) {
        console.log('Expiry alert:', event);
      }
      this.expiryAlertSubject.next(event);
    });
  }

  /**
   * Start all SignalR connections
   */
  async start(): Promise<void> {
    if (!environment.enableSignalR) {
      return;
    }

    // Prevent concurrent start operations
    if (this.isStarting) {
      return;
    }

    this.isStarting = true;
    try {
      // Start import hub
      if (this.importHubConnection && this.importHubConnection.state !== HubConnectionState.Connected) {
        await this.startHub(this.importHubConnection, 'Import');
      }

      // Start inventory hub
      if (this.inventoryHubConnection && this.inventoryHubConnection.state !== HubConnectionState.Connected) {
        await this.startHub(this.inventoryHubConnection, 'Inventory');
      }

      this.connectionStateSubject.next(HubConnectionState.Connected);
    } catch (error: any) {
      if (!environment.production) {
        console.debug('SignalR: Some hubs may not be available');
      }
    } finally {
      this.isStarting = false;
    }
  }

  /**
   * Start a specific hub connection
   */
  private async startHub(hub: HubConnection, hubName: string): Promise<void> {
    try {
      await hub.start();
      if (!environment.production) {
        console.log(`SignalR ${hubName} hub connected`);
      }
    } catch (error: any) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('ERR_CONNECTION_REFUSED') ||
          error?.message?.includes('Failed to complete negotiation')) {
        if (!environment.production) {
          console.debug(`SignalR ${hubName} hub: Backend not available, will retry automatically`);
        }
      } else if (!environment.production) {
        console.warn(`SignalR ${hubName} hub connection error:`, error);
      }
    }
  }

  /**
   * Stop all SignalR connections
   */
  async stop(): Promise<void> {
    if (this.isStopping) {
      return;
    }

    this.isStopping = true;
    try {
      if (this.importHubConnection && this.importHubConnection.state !== HubConnectionState.Disconnected) {
        await this.importHubConnection.stop();
      }
      
      if (this.inventoryHubConnection && this.inventoryHubConnection.state !== HubConnectionState.Disconnected) {
        await this.inventoryHubConnection.stop();
      }

      this.connectionStateSubject.next(HubConnectionState.Disconnected);
    } catch (error) {
      if (!environment.production) {
        console.error('Error stopping SignalR connections:', error);
      }
    } finally {
      this.isStopping = false;
    }
  }

  /**
   * Subscribe to import progress for a specific job
   */
  subscribeToImportProgress(jobId: string): Observable<ImportProgressEvent> {
    return this.importProgress$.pipe(
      // Filter by jobId if needed (backend should send jobId in event)
      // For now, we'll return all progress events
    );
  }

  /**
   * Get current connection state (returns connected if any hub is connected)
   */
  getConnectionState(): HubConnectionState {
    const importConnected = this.importHubConnection?.state === HubConnectionState.Connected;
    const inventoryConnected = this.inventoryHubConnection?.state === HubConnectionState.Connected;
    
    if (importConnected || inventoryConnected) {
      return HubConnectionState.Connected;
    }
    
    return HubConnectionState.Disconnected;
  }

  /**
   * Check if any hub is connected
   */
  isConnected(): boolean {
    return this.getConnectionState() === HubConnectionState.Connected;
  }

  /**
   * Check if inventory hub is connected
   */
  isInventoryHubConnected(): boolean {
    return this.inventoryHubConnection?.state === HubConnectionState.Connected;
  }

  /**
   * Cleanup and dispose resources
   * Should be called when application is destroyed
   */
  async dispose(): Promise<void> {
    await this.stop();
    
    // Complete subjects to allow garbage collection
    this.connectionStateSubject.complete();
    this.importProgressSubject.complete();
    this.lowStockAlertSubject.complete();
    this.grnCompletedSubject.complete();
    this.expiryAlertSubject.complete();
    
    // Clear hub connections
    this.importHubConnection = null;
    this.inventoryHubConnection = null;
  }
}


