import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PurchasingService } from '@core/services/purchasing.service';
import { ToastService } from '@core/toast/toast.service';
import { SignalRService } from '@core/services/signalr.service';
import { GoodsReceiveNote, ConfirmGRNResponse } from '@core/models/purchasing.model';

@Component({
  selector: 'grocery-grn-confirm',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Confirm GRN</h1>
      @if (grn()) {
        <p>GRN Number: {{ grn()!.grnNumber }}</p>
        <p>Total Amount: {{ grn()!.totalAmount | currency: 'INR' }}</p>
        <button mat-raised-button color="primary" (click)="confirmGRN()" [disabled]="loading()">
          Confirm GRN
        </button>
        <button mat-button (click)="goBack()">Cancel</button>
      }
    </div>
  `,
})
export class GRNConfirmComponent implements OnInit {
  private purchasingService = inject(PurchasingService);
  private toastService = inject(ToastService);
  private signalRService = inject(SignalRService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  grn = signal<GoodsReceiveNote | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGRN(id);
    }

    // Subscribe to GRN completed event
    this.signalRService.grnCompleted$.subscribe((event) => {
      this.toastService.success(`GRN ${event.grnNumber} completed successfully!`);
      // Refresh inventory or navigate
    });
  }

  loadGRN(id: string): void {
    this.purchasingService.getGRNById(id).subscribe({
      next: (grn) => this.grn.set(grn),
      error: (error) => {
        this.toastService.error('Failed to load GRN');
        console.error(error);
      },
    });
  }

  confirmGRN(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    const idempotencyKey = `grn-${id}-${Date.now()}`;

    this.purchasingService.confirmGRN(id, { idempotencyKey }).subscribe({
      next: (response: ConfirmGRNResponse) => {
        this.toastService.success(response.message || 'GRN confirmed successfully');
        this.loading.set(false);
        // Navigate to GRN details or inventory
        this.router.navigate(['/purchasing/grn', id]);
      },
      error: (error) => {
        this.toastService.error('Failed to confirm GRN');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  goBack(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/purchasing/grn', id]);
  }
}

