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

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  private connectionStateSubject = new Subject<HubConnectionState>();
  private importProgressSubject = new Subject<ImportProgressEvent>();
  private authService = inject(AuthService);
  
  // Flags to prevent concurrent start/stop operations
  private isStarting = false;
  private isStopping = false;

  public connectionState$ = this.connectionStateSubject.asObservable();
  public importProgress$ = this.importProgressSubject.asObservable();

  constructor() {
    if (environment.enableSignalR) {
      this.initializeConnection();
    }
  }

  /**
   * Initialize SignalR hub connection
   */
  private initializeConnection(): void {
    if (!environment.enableSignalR) {
      return;
    }

    // Get access token for authentication
    const accessToken = this.authService.getAccessToken();
    
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.signalRHub, {
        accessTokenFactory: () => {
          // Return the current access token
          const token = this.authService.getAccessToken();
          return token || '';
        },
        withCredentials: false // We're using token in header, not cookies
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0s, 2s, 10s, 30s, then 30s intervals
          if (retryContext.previousRetryCount === 0) {
            return 0;
          }
          if (retryContext.previousRetryCount === 1) {
            return 2000;
          }
          if (retryContext.previousRetryCount === 2) {
            return 10000;
          }
          return 30000;
        },
      })
      .configureLogging(LogLevel.Information)
      .build();

    this.setupEventHandlers();
  }

  /**
   * Setup SignalR event handlers
   */
  private setupEventHandlers(): void {
    if (!this.hubConnection) {
      return;
    }

    // Connection state changes
    this.hubConnection.onclose((error) => {
      console.warn('SignalR connection closed', error);
      this.connectionStateSubject.next(HubConnectionState.Disconnected);
    });

    this.hubConnection.onreconnecting((error) => {
      console.log('SignalR reconnecting...', error);
      this.connectionStateSubject.next(HubConnectionState.Reconnecting);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log('SignalR reconnected:', connectionId);
      this.connectionStateSubject.next(HubConnectionState.Connected);
    });

    // Import progress event
    this.hubConnection.on('ImportProgressUpdated', (event: ImportProgressEvent) => {
      console.log('Import progress updated:', event);
      this.importProgressSubject.next(event);
    });
  }

  /**
   * Start the SignalR connection
   */
  async start(): Promise<void> {
    if (!this.hubConnection || !environment.enableSignalR) {
      return;
    }

    // Prevent concurrent start operations
    if (this.isStarting) {
      console.log('SignalR start already in progress');
      return;
    }

    if (this.hubConnection.state === HubConnectionState.Connected) {
      return;
    }

    this.isStarting = true;
    try {
      await this.hubConnection.start();
      console.log('SignalR connection started');
      this.connectionStateSubject.next(HubConnectionState.Connected);
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      this.connectionStateSubject.next(HubConnectionState.Disconnected);
      throw error;
    } finally {
      this.isStarting = false;
    }
  }

  /**
   * Stop the SignalR connection
   */
  async stop(): Promise<void> {
    if (!this.hubConnection) {
      return;
    }

    // Prevent concurrent stop operations
    if (this.isStopping) {
      console.log('SignalR stop already in progress');
      return;
    }

    if (this.hubConnection.state === HubConnectionState.Disconnected) {
      return;
    }

    this.isStopping = true;
    try {
      // Remove event handlers before stopping
      const handlers = (this.hubConnection as any)._handlers;
      if (handlers) {
        this.hubConnection.off('ImportProgressUpdated', handlers.onImportProgress);
        // Note: onclose, onreconnecting, onreconnected are not removable in SignalR
        // They will be cleaned up when connection is stopped
      }

      await this.hubConnection.stop();
      console.log('SignalR connection stopped');
      this.connectionStateSubject.next(HubConnectionState.Disconnected);
    } catch (error) {
      console.error('Error stopping SignalR connection:', error);
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
   * Get current connection state
   */
  getConnectionState(): HubConnectionState {
    return this.hubConnection?.state || HubConnectionState.Disconnected;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.hubConnection?.state === HubConnectionState.Connected;
  }

  /**
   * Cleanup and dispose resources
   * Should be called when application is destroyed
   */
  async dispose(): Promise<void> {
    // Stop connection
    await this.stop();
    
    // Complete subjects to allow garbage collection
    this.connectionStateSubject.complete();
    this.importProgressSubject.complete();
    
    // Clear hub connection
    this.hubConnection = null;
  }
}


