import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { SupplierService } from '@core/services/supplier.service';
import { ToastService } from '@core/toast/toast.service';
import { Supplier } from '@core/models/supplier.model';

@Component({
  selector: 'grocery-suppliers-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSelectModule,
  ],
  template: `
    <div class="suppliers-list-container p-4 max-w-7xl mx-auto">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold">Suppliers</h1>
        <button mat-raised-button color="primary" (click)="createNewSupplier()">
          <mat-icon>add</mat-icon>
          New Supplier
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="mb-4">
        <mat-card-content>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="searchTerm" (keyup.enter)="onSearch()" placeholder="Name, phone, email..." />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="isActiveFilter" (selectionChange)="onFilterChange()">
                <mat-option [value]="null">All</mat-option>
                <mat-option [value]="true">Active</mat-option>
                <mat-option [value]="false">Inactive</mat-option>
              </mat-select>
            </mat-form-field>
            <div class="flex items-end">
              <button mat-button (click)="onSearch()">
                <mat-icon>search</mat-icon>
                Search
              </button>
              <button mat-button (click)="clearFilters()">
                <mat-icon>clear</mat-icon>
                Clear
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Suppliers Table -->
      <mat-card>
        <mat-card-content>
          @if (loading()) {
            <div class="flex justify-center p-8">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (suppliers().length === 0) {
            <div class="text-center py-8 text-gray-500">
              <mat-icon class="text-6xl text-gray-400 mb-4">business</mat-icon>
              <p>No suppliers found</p>
            </div>
          } @else {
            <table mat-table [dataSource]="suppliers()" class="w-full">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let supplier">
                  <div>
                    <div class="font-semibold">{{ supplier.name }}</div>
                    @if (supplier.contactPerson) {
                      <div class="text-sm text-gray-500">{{ supplier.contactPerson }}</div>
                    }
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="contact">
                <th mat-header-cell *matHeaderCellDef>Contact</th>
                <td mat-cell *matCellDef="let supplier">
                  <div>
                    @if (supplier.phone) {
                      <div>{{ supplier.phone }}</div>
                    }
                    @if (supplier.email) {
                      <div class="text-sm text-gray-500">{{ supplier.email }}</div>
                    }
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="address">
                <th mat-header-cell *matHeaderCellDef>Address</th>
                <td mat-cell *matCellDef="let supplier">
                  {{ supplier.address || 'N/A' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="gstNumber">
                <th mat-header-cell *matHeaderCellDef>GST Number</th>
                <td mat-cell *matCellDef="let supplier">
                  {{ supplier.gstNumber || 'N/A' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let supplier">
                  <mat-chip [color]="supplier.isActive ? 'primary' : 'warn'">
                    {{ supplier.isActive ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let supplier">
                  <button mat-icon-button (click)="viewSupplier(supplier.id)" matTooltip="View Details">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button (click)="editSupplier(supplier.id)" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
            <mat-paginator
              [length]="totalCount()"
              [pageSize]="pageSize()"
              [pageIndex]="pageNumber() - 1"
              [pageSizeOptions]="[10, 20, 50, 100]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .suppliers-list-container {
      min-height: calc(100vh - 64px);
    }
  `]
})
export class SuppliersListComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  suppliers = signal<Supplier[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(20);
  searchTerm = '';
  isActiveFilter: boolean | null = null;

  displayedColumns = ['name', 'contact', 'address', 'gstNumber', 'status', 'actions'];

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading.set(true);
    this.supplierService.getSuppliers({
      search: this.searchTerm || undefined,
      isActive: this.isActiveFilter ?? undefined,
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    }).subscribe({
      next: (response) => {
        this.suppliers.set(response.items || []);
        this.totalCount.set(response.totalCount || 0);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.toastService.error('Failed to load suppliers');
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadSuppliers();
  }

  onSearch(): void {
    this.pageNumber.set(1);
    this.loadSuppliers();
  }

  onFilterChange(): void {
    this.pageNumber.set(1);
    this.loadSuppliers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.isActiveFilter = null;
    this.pageNumber.set(1);
    this.loadSuppliers();
  }

  viewSupplier(supplierId: string): void {
    this.router.navigate(['/admin/suppliers', supplierId]);
  }

  editSupplier(supplierId: string): void {
    this.router.navigate(['/admin/suppliers', supplierId, 'edit']);
  }

  createNewSupplier(): void {
    this.router.navigate(['/admin/suppliers/new']);
  }
}

