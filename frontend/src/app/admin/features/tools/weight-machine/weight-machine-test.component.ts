import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { WeightScaleService, WeightReading, ScaleStatus } from '@core/services/weight-scale.service';
import { ToastService } from '@core/toast/toast.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'grocery-weight-machine-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  template: `
    <div class="admin-page-container">
      <div class="admin-page-header">
        <h1>Weight Machine Test</h1>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Connection Status -->
        <mat-card>
          <mat-card-content>
            <h2 class="text-lg font-semibold mb-4">Connection Status</h2>
            <div class="flex items-center gap-4 mb-4">
              <mat-chip [color]="isConnected() ? 'primary' : 'warn'">
                @if (isConnected()) {
                  <mat-icon>check_circle</mat-icon>
                  Connected
                } @else {
                  <mat-icon>error</mat-icon>
                  Disconnected
                }
              </mat-chip>
            </div>
            <div class="flex gap-2">
              <button mat-raised-button color="primary" (click)="connect()" [disabled]="isConnected() || connecting()">
                @if (connecting()) {
                  <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                }
                Connect
              </button>
              <button mat-raised-button color="warn" (click)="disconnect()" [disabled]="!isConnected()">
                Disconnect
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Weight Reading -->
        <mat-card>
          <mat-card-content>
            <h2 class="text-lg font-semibold mb-4">Weight Reading</h2>
            @if (reading()) {
              <div class="text-center">
                <div class="text-4xl font-bold mb-2">{{ reading()?.weight }}</div>
                <div class="text-lg text-gray-500">{{ reading()?.unit }}</div>
                <div class="text-sm text-gray-400 mt-2">
                  {{ reading()?.timestamp | date:'short' }}
                </div>
              </div>
            } @else {
              <div class="text-center text-gray-500 py-8">
                No reading available
              </div>
            }
            <div class="flex gap-2 mt-4">
              <button mat-raised-button (click)="readWeight()" [disabled]="!isConnected() || readingWeight()">
                @if (readingWeight()) {
                  <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                }
                Read Weight
              </button>
              <button mat-raised-button (click)="tare()" [disabled]="!isConnected() || taring()">
                @if (taring()) {
                  <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                }
                Tare
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      @if (autoReadEnabled()) {
        <mat-card class="mt-4">
          <mat-card-content>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">Auto Read Mode</h3>
                <p class="text-sm text-gray-500">Reading weight every 2 seconds</p>
              </div>
              <button mat-button (click)="toggleAutoRead()">
                <mat-icon>stop</mat-icon>
                Stop Auto Read
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .admin-page-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .admin-page-header {
      margin-bottom: 24px;
    }
    .admin-page-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  `]
})
export class WeightMachineTestComponent implements OnInit, OnDestroy {
  private weightScaleService = inject(WeightScaleService);
  private toastService = inject(ToastService);

  isConnected = signal(false);
  connecting = signal(false);
  reading = signal<WeightReading | null>(null);
  readingWeight = signal(false);
  taring = signal(false);
  autoReadEnabled = signal(false);
  private autoReadSubscription?: Subscription;
  private statusCheckSubscription?: Subscription;

  ngOnInit(): void {
    this.checkStatus();
    // Check status every 5 seconds
    this.statusCheckSubscription = interval(5000).subscribe(() => {
      if (this.isConnected()) {
        this.checkStatus();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.autoReadSubscription) {
      this.autoReadSubscription.unsubscribe();
    }
    if (this.statusCheckSubscription) {
      this.statusCheckSubscription.unsubscribe();
    }
  }

  checkStatus(): void {
    this.weightScaleService.getStatus().subscribe({
      next: (status) => {
        this.isConnected.set(status.isConnected);
      },
      error: () => {
        this.isConnected.set(false);
      },
    });
  }

  connect(): void {
    this.connecting.set(true);
    this.weightScaleService.connect().subscribe({
      next: (response) => {
        this.toastService.success(response.message || 'Connected successfully');
        this.isConnected.set(true);
        this.connecting.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to connect to weight scale');
        console.error('Error connecting:', error);
        this.connecting.set(false);
      },
    });
  }

  disconnect(): void {
    this.weightScaleService.disconnect().subscribe({
      next: (response) => {
        this.toastService.success(response.message || 'Disconnected successfully');
        this.isConnected.set(false);
        this.reading.set(null);
        this.stopAutoRead();
      },
      error: (error) => {
        this.toastService.error('Failed to disconnect');
        console.error('Error disconnecting:', error);
      },
    });
  }

  readWeight(): void {
    this.readingWeight.set(true);
    this.weightScaleService.readWeight().subscribe({
      next: (reading) => {
        this.reading.set(reading);
        this.readingWeight.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to read weight');
        console.error('Error reading weight:', error);
        this.readingWeight.set(false);
      },
    });
  }

  tare(): void {
    this.taring.set(true);
    this.weightScaleService.tare().subscribe({
      next: (response) => {
        this.toastService.success(response.message || 'Tare completed');
        this.taring.set(false);
        // Read weight after tare
        this.readWeight();
      },
      error: (error) => {
        this.toastService.error('Failed to tare');
        console.error('Error taring:', error);
        this.taring.set(false);
      },
    });
  }

  toggleAutoRead(): void {
    if (this.autoReadEnabled()) {
      this.stopAutoRead();
    } else {
      this.startAutoRead();
    }
  }

  startAutoRead(): void {
    this.autoReadEnabled.set(true);
    this.autoReadSubscription = interval(2000).subscribe(() => {
      if (this.isConnected()) {
        this.readWeight();
      } else {
        this.stopAutoRead();
      }
    });
  }

  stopAutoRead(): void {
    this.autoReadEnabled.set(false);
    if (this.autoReadSubscription) {
      this.autoReadSubscription.unsubscribe();
    }
  }
}



