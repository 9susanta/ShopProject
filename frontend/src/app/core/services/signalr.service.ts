import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.signalRHub)
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

    if (this.hubConnection.state === HubConnectionState.Connected) {
      return;
    }

    try {
      await this.hubConnection.start();
      console.log('SignalR connection started');
      this.connectionStateSubject.next(HubConnectionState.Connected);
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      this.connectionStateSubject.next(HubConnectionState.Disconnected);
      throw error;
    }
  }

  /**
   * Stop the SignalR connection
   */
  async stop(): Promise<void> {
    if (!this.hubConnection) {
      return;
    }

    if (this.hubConnection.state === HubConnectionState.Disconnected) {
      return;
    }

    try {
      await this.hubConnection.stop();
      console.log('SignalR connection stopped');
      this.connectionStateSubject.next(HubConnectionState.Disconnected);
    } catch (error) {
      console.error('Error stopping SignalR connection:', error);
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
}


