import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalRService } from './core/services/signalr.service';
import { AuthService } from './core/services/auth.service';
import { ToastComponent } from './shared/ui/toast/toast.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'grocery-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = signal('Grocery Store Management System');
  isSignalRConnected = signal(false);

  private signalRService = inject(SignalRService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    if (environment.enableSignalR) {
      this.signalRService.start()
        .then(() => this.isSignalRConnected.set(true))
        .catch((error: any) => {
          // Silently handle connection refused (backend not running)
          if (!error?.message?.includes('Failed to fetch') && 
              !error?.message?.includes('ERR_CONNECTION_REFUSED')) {
            // Only log non-connection errors in development
            if (!environment.production) {
              console.debug('SignalR connection failed:', error);
            }
          }
          this.isSignalRConnected.set(false);
        });
    }
  }

  ngOnDestroy(): void {
    if (environment.enableSignalR) {
      this.signalRService.dispose().catch((error) => {
        console.warn('Error disposing SignalR service:', error);
      });
    }
  }
}


