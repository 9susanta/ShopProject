import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'grocery-sale-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
  ],
  template: `
    <div class="sale-details-container p-4 max-w-6xl mx-auto">
      <div class="mb-4">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Sales
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-header>
            <mat-card-title>Sale Details</mat-card-title>
            <mat-card-subtitle>Sale ID: {{ saleId() }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="text-center py-8">
              <mat-icon class="text-6xl text-gray-400 mb-4">receipt_long</mat-icon>
              <h2 class="text-xl font-semibold mb-2">Sale Details Page</h2>
              <p class="text-gray-500">Full implementation coming soon</p>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .sale-details-container {
      min-height: calc(100vh - 64px);
    }
  `]
})
export class SaleDetailsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  saleId = signal<string | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.saleId.set(id);
      // TODO: Load sale details
      // this.loadSale(id);
    } else {
      this.toastService.error('Sale ID is required');
      this.goBack();
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/sales']);
  }
}

