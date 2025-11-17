import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PurchasingService } from '@core/services/purchasing.service';
import { ToastService } from '@core/toast/toast.service';
import { GoodsReceiveNote, GRNStatus } from '@core/models/purchasing.model';

@Component({
  selector: 'grocery-grn-details',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">GRN Details</h1>
      @if (grn()) {
        <p>GRN Number: {{ grn()!.grnNumber }}</p>
        <button mat-button (click)="goBack()">Back</button>
        @if (grn()!.status === GRNStatus.Draft) {
          <button mat-raised-button color="primary" (click)="confirm()">Confirm GRN</button>
        }
      }
    </div>
  `,
})
export class GRNDetailsComponent implements OnInit {
  private purchasingService = inject(PurchasingService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  grn = signal<GoodsReceiveNote | null>(null);
  GRNStatus = GRNStatus;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGRN(id);
    }
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

  confirm(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/purchasing/grn', id, 'confirm']);
    }
  }

  goBack(): void {
    this.router.navigate(['/purchasing/grn']);
  }
}

