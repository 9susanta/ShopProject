import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'grocery-offline-indicator',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatChipsModule],
  template: `
    @if (!isOnline()) {
      <mat-chip class="offline-chip">
        <mat-icon>cloud_off</mat-icon>
        Offline Mode
      </mat-chip>
    }
  `,
  styles: [
    `
      .offline-chip {
        background-color: #f44336;
        color: white;
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 1000;
      }
    `,
  ],
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {
  isOnline = signal(navigator.onLine);

  ngOnInit(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    this.isOnline.set(true);
  };

  private handleOffline = () => {
    this.isOnline.set(false);
  };
}



