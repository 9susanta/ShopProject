import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { SupplierService } from '@core/services/supplier.service';
import { ToastService } from '@core/toast/toast.service';
import { Supplier } from '@core/models/supplier.model';

@Component({
  selector: 'grocery-supplier-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTableModule,
  ],
  template: `
    <div class="supplier-details-container p-4 max-w-6xl mx-auto">
      <div class="mb-4">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Suppliers
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (supplier()) {
        <!-- Supplier Information -->
        <mat-card class="mb-4">
          <mat-card-header>
            <mat-card-title>{{ supplier()!.name }}</mat-card-title>
            <mat-card-subtitle>
              <mat-chip [color]="supplier()!.isActive ? 'primary' : 'warn'">
                {{ supplier()!.isActive ? 'Active' : 'Inactive' }}
              </mat-chip>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              @if (supplier()!.contactPerson) {
                <div>
                  <strong>Contact Person:</strong> {{ supplier()!.contactPerson }}
                </div>
              }
              @if (supplier()!.phone) {
                <div>
                  <strong>Phone:</strong> {{ supplier()!.phone }}
                </div>
              }
              @if (supplier()!.email) {
                <div>
                  <strong>Email:</strong> {{ supplier()!.email }}
                </div>
              }
              @if (supplier()!.gstNumber) {
                <div>
                  <strong>GST Number:</strong> {{ supplier()!.gstNumber }}
                </div>
              }
              @if (supplier()!.address) {
                <div class="md:col-span-2">
                  <strong>Address:</strong> {{ supplier()!.address }}
                </div>
              }
              <div>
                <strong>Created:</strong> {{ supplier()!.createdAt | date: 'short' }}
              </div>
              @if (supplier()!.updatedAt) {
                <div>
                  <strong>Last Updated:</strong> {{ supplier()!.updatedAt | date: 'short' }}
                </div>
              }
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="editSupplier()">
              <mat-icon>edit</mat-icon>
              Edit Supplier
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Purchase Orders (if available) -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Purchase Orders</mat-card-title>
            <mat-card-subtitle>Purchase orders from this supplier</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="text-center py-8 text-gray-500">
              <mat-icon class="text-6xl text-gray-400 mb-4">receipt_long</mat-icon>
              <p>Purchase orders will be displayed here</p>
              <button mat-button (click)="viewPurchaseOrders()" class="mt-4">
                <mat-icon>list</mat-icon>
                View All Purchase Orders
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="text-center py-8">
              <mat-icon class="text-6xl text-gray-400 mb-4">business</mat-icon>
              <h2 class="text-xl font-semibold mb-2">Supplier not found</h2>
              <p class="text-gray-500">The supplier you're looking for doesn't exist.</p>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .supplier-details-container {
      min-height: calc(100vh - 64px);
    }
  `]
})
export class SupplierDetailsComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  supplier = signal<Supplier | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSupplier(id);
    } else {
      this.toastService.error('Supplier ID is required');
      this.goBack();
    }
  }

  loadSupplier(id: string): void {
    this.loading.set(true);
    this.supplierService.getSupplierById(id).subscribe({
      next: (supplier) => {
        this.supplier.set(supplier);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading supplier:', error);
        this.toastService.error('Failed to load supplier');
        this.loading.set(false);
        this.goBack();
      },
    });
  }

  editSupplier(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/admin/suppliers', id, 'edit']);
    }
  }

  viewPurchaseOrders(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/admin/purchasing/purchase-orders'], { queryParams: { supplierId: id } });
    } else {
      this.router.navigate(['/admin/purchasing/purchase-orders']);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/suppliers']);
  }
}

