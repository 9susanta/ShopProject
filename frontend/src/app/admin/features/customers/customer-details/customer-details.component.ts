import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { CustomerService } from '@core/services/customer.service';
import { ToastService } from '@core/toast/toast.service';
import { Customer } from '@core/models/customer.model';

@Component({
  selector: 'grocery-customer-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  template: `
    <div class="customer-details-container p-4 max-w-6xl mx-auto">
      <div class="mb-4">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Customers
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (customer()) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ customer()!.name }}</mat-card-title>
            <mat-card-subtitle>
              @if (customer()!.isActive) {
                <mat-chip color="primary">Active</mat-chip>
              } @else {
                <mat-chip color="warn">Inactive</mat-chip>
              }
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <strong>Phone:</strong> {{ customer()!.phone || 'N/A' }}
              </div>
              <div>
                <strong>Email:</strong> {{ customer()!.email || 'N/A' }}
              </div>
              <div class="md:col-span-2">
                <strong>Address:</strong> {{ customer()!.address || 'N/A' }}
              </div>
              <div>
                <strong>Total Orders:</strong> {{ customer()!.totalOrders || 0 }}
              </div>
              <div>
                <strong>Total Spent:</strong> {{ customer()!.totalSpent | currency: 'INR' }}
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="text-center py-8">
              <mat-icon class="text-6xl text-gray-400 mb-4">person</mat-icon>
              <h2 class="text-xl font-semibold mb-2">Customer not found</h2>
              <p class="text-gray-500">The customer you're looking for doesn't exist.</p>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .customer-details-container {
      min-height: calc(100vh - 64px);
    }
  `]
})
export class CustomerDetailsComponent implements OnInit {
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  customer = signal<Customer | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCustomer(id);
    } else {
      this.toastService.error('Customer ID is required');
      this.goBack();
    }
  }

  loadCustomer(id: string): void {
    this.loading.set(true);
    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load customer');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/customers']);
  }
}

