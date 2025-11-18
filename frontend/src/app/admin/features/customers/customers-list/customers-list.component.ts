import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CustomerService } from '@core/services/customer.service';
import { ToastService } from '@core/toast/toast.service';
import { Customer } from '@core/models/customer.model';

@Component({
  selector: 'grocery-customers-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
    MatFormFieldModule,
  ],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.css',
})
export class CustomersListComponent implements OnInit {
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  customers = signal<Customer[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(20);
  searchTerm = signal('');
  isActiveFilter = signal<boolean | null>(null);

  displayedColumns: string[] = [
    'name',
    'phone',
    'email',
    'address',
    'totalOrders',
    'totalSpent',
    'status',
    'actions',
  ];

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    const filters: any = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    };

    if (this.searchTerm()) {
      filters.search = this.searchTerm();
    }

    if (this.isActiveFilter() !== null) {
      filters.isActive = this.isActiveFilter();
    }

    this.customerService.getCustomers(filters).subscribe({
      next: (response) => {
        this.customers.set(response.items);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load customers');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadCustomers();
  }

  onSearch(): void {
    this.pageNumber.set(1);
    this.loadCustomers();
  }

  onFilterChange(): void {
    this.pageNumber.set(1);
    this.loadCustomers();
  }

  viewCustomer(customerId: string): void {
    this.router.navigate(['/admin/customers', customerId]);
  }

  createNewCustomer(): void {
    // Navigate to customer form (if exists) or show a toast
    this.toastService.info('Customer creation form coming soon. For now, customers are created during sales.');
    // TODO: Navigate to customer form when implemented
    // this.router.navigate(['/admin/customers/new']);
  }
}
