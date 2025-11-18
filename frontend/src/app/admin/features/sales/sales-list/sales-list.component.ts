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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SaleService } from '@core/services/sale.service';
import { ToastService } from '@core/toast/toast.service';
import { Sale, SaleStatus } from '@core/models/sale.model';

@Component({
  selector: 'grocery-sales-list',
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
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './sales-list.component.html',
  styleUrl: './sales-list.component.css',
})
export class SalesListComponent implements OnInit {
  private saleService = inject(SaleService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  sales = signal<Sale[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(20);
  searchTerm = signal('');
  statusFilter = signal<string>('');

  displayedColumns: string[] = [
    'invoiceNumber',
    'customerName',
    'saleDate',
    'items',
    'totalAmount',
    'paymentMethod',
    'status',
    'actions',
  ];

  statusOptions = [
    { value: '', label: 'All' },
    { value: SaleStatus.Completed, label: 'Completed' },
    { value: SaleStatus.Pending, label: 'Pending' },
    { value: SaleStatus.Cancelled, label: 'Cancelled' },
  ];

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.loading.set(true);
    const filters: any = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    };

    if (this.searchTerm()) {
      filters.search = this.searchTerm();
    }

    if (this.statusFilter()) {
      filters.status = this.statusFilter();
    }

    this.saleService.getSales(filters).subscribe({
      next: (response) => {
        this.sales.set(response.items);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load sales');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadSales();
  }

  onSearch(): void {
    this.pageNumber.set(1);
    this.loadSales();
  }

  onFilterChange(): void {
    this.pageNumber.set(1);
    this.loadSales();
  }

  viewSale(saleId: string): void {
    this.router.navigate(['/admin/sales', saleId]);
  }

  getStatusColor(status: SaleStatus): string {
    switch (status) {
      case SaleStatus.Completed:
        return 'primary';
      case SaleStatus.Pending:
        return 'accent';
      case SaleStatus.Cancelled:
        return 'warn';
      default:
        return '';
    }
  }

  getItemCount(items: any[]): number {
    return items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }
}
