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
    // Only start SignalR if user is already authenticated
    // Otherwise, it will be started after successful login
    if (environment.enableSignalR && this.authService.isAuthenticated()) {
      this.signalRService.start()
        .then(() => this.isSignalRConnected.set(true))
        .catch((error: any) => {
          // Silently handle connection errors - don't log to console
          this.isSignalRConnected.set(false);
        });
    }
    
    // Subscribe to auth state changes to start SignalR after login
    this.authService.currentUser$.subscribe(user => {
      if (user && environment.enableSignalR && !this.isSignalRConnected()) {
        this.signalRService.start()
          .then(() => this.isSignalRConnected.set(true))
          .catch(() => {
            // Silently handle - SignalR will retry automatically
            this.isSignalRConnected.set(false);
          });
      } else if (!user && this.isSignalRConnected()) {
        // Stop SignalR on logout
        this.signalRService.dispose().catch(() => {});
        this.isSignalRConnected.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    if (environment.enableSignalR) {
      this.signalRService.dispose().catch((error) => {
        console.warn('Error disposing SignalR service:', error);
      });
    }
  }
}


