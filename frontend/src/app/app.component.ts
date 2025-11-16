import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalRService } from './core/services/signalr.service';
import { AuthService } from './core/services/auth.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'grocery-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  // Using signals for reactive state
  title = signal('Grocery Store Management System');
  isSignalRConnected = signal(false);

  // Using inject() instead of constructor injection (Angular 20 feature)
  private signalRService = inject(SignalRService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Initialize SignalR connection if enabled
    if (environment.enableSignalR) {
      this.signalRService.start()
        .then(() => this.isSignalRConnected.set(true))
        .catch((error) => {
          console.warn('SignalR connection failed:', error);
          this.isSignalRConnected.set(false);
        });
    }
  }
}


