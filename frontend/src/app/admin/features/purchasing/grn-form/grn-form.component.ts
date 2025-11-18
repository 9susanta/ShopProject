import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PurchasingService } from '@core/services/purchasing.service';
import { ToastService } from '@core/toast/toast.service';
import { CreateGRNRequest } from '@core/models/purchasing.model';

@Component({
  selector: 'grocery-grn-form',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Create GRN</h1>
      <p class="text-gray-600">GRN form component - Full implementation pending</p>
      <button mat-button (click)="goBack()">Back</button>
    </div>
  `,
})
export class GRNFormComponent implements OnInit {
  private purchasingService = inject(PurchasingService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const poId = this.route.snapshot.queryParams['poId'];
    if (poId) {
      // Load PO and pre-fill GRN form
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/purchasing/grn']);
  }
}

