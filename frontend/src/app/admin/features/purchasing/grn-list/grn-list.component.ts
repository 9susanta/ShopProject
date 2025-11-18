import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PurchasingService } from '@core/services/purchasing.service';
import { ToastService } from '@core/toast/toast.service';
import { GoodsReceiveNote, GRNListResponse, GRNFilters, GRNStatus } from '@core/models/purchasing.model';

@Component({
  selector: 'grocery-grn-list',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="grn-list-container p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Goods Receive Notes</h1>
        <button mat-raised-button color="primary" routerLink="/admin/purchasing/grn/new">
          <mat-icon>add</mat-icon>
          New GRN
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-card mb-4 p-4 bg-white rounded-lg shadow">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="filters().status">
              <mat-option [value]="undefined">All</mat-option>
              <mat-option [value]="GRNStatus.Draft">Draft</mat-option>
              <mat-option [value]="GRNStatus.Confirmed">Confirmed</mat-option>
              <mat-option [value]="GRNStatus.Cancelled">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>From Date</mat-label>
            <input matInput [matDatepicker]="fromPicker" [(ngModel)]="filters().receiveDateFrom" />
            <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
            <mat-datepicker #fromPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>To Date</mat-label>
            <input matInput [matDatepicker]="toPicker" [(ngModel)]="filters().receiveDateTo" />
            <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
            <mat-datepicker #toPicker></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="flex gap-2 mt-4">
          <button mat-raised-button color="primary" (click)="applyFilters()">Apply Filters</button>
          <button mat-button (click)="clearFilters()">Clear</button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container bg-white rounded-lg shadow overflow-hidden">
        @if (loading()) {
          <div class="flex justify-center items-center p-8">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <table mat-table [dataSource]="grns()" class="w-full">
            <ng-container matColumnDef="grnNumber">
              <th mat-header-cell *matHeaderCellDef>GRN Number</th>
              <td mat-cell *matCellDef="let grn">
                <a (click)="viewDetails(grn.id)" class="text-blue-600 hover:underline cursor-pointer">{{ grn.grnNumber }}</a>
              </td>
            </ng-container>

            <ng-container matColumnDef="supplierName">
              <th mat-header-cell *matHeaderCellDef>Supplier</th>
              <td mat-cell *matCellDef="let grn">{{ grn.supplierName || 'N/A' }}</td>
            </ng-container>

            <ng-container matColumnDef="receiveDate">
              <th mat-header-cell *matHeaderCellDef>Receive Date</th>
              <td mat-cell *matCellDef="let grn">{{ grn.receiveDate | date: 'short' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let grn">
                <mat-chip [style.background-color]="getStatusColor(grn.status) + '20'">
                  {{ getStatusLabel(grn.status) }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="totalAmount">
              <th mat-header-cell *matHeaderCellDef>Total Amount</th>
              <td mat-cell *matCellDef="let grn">{{ grn.totalAmount | currency: 'INR' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let grn">
                <div class="flex gap-2">
                  <button mat-icon-button (click)="viewDetails(grn.id)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  @if (grn.status === GRNStatus.Draft) {
                    <button mat-icon-button (click)="confirmGRN(grn.id)">
                      <mat-icon>check_circle</mat-icon>
                    </button>
                  }
                </div>
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
      </div>
    </div>
  `,
  styles: [`
    .grn-list-container { max-width: 1400px; margin: 0 auto; }
    .filters-card { border: 1px solid #e0e0e0; }
    .table-container { border: 1px solid #e0e0e0; }
    table { width: 100%; }
    .mat-mdc-row:hover { background-color: #f5f5f5; cursor: pointer; }
  `],
})
export class GRNListComponent implements OnInit {
  private purchasingService = inject(PurchasingService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  grns = signal<GoodsReceiveNote[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(20);
  filters = signal<GRNFilters>({ pageNumber: 1, pageSize: 20 });
  GRNStatus = GRNStatus;

  displayedColumns: string[] = ['grnNumber', 'supplierName', 'receiveDate', 'status', 'totalAmount', 'actions'];

  ngOnInit(): void {
    this.loadGRNs();
  }

  loadGRNs(): void {
    this.loading.set(true);
    const currentFilters = { ...this.filters(), pageNumber: this.pageNumber(), pageSize: this.pageSize() };
    this.purchasingService.getGRNs(currentFilters).subscribe({
      next: (response: GRNListResponse) => {
        this.grns.set(response.items);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load GRNs');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadGRNs();
  }

  applyFilters(): void {
    this.pageNumber.set(1);
    this.loadGRNs();
  }

  clearFilters(): void {
    this.filters.set({ pageNumber: 1, pageSize: this.pageSize() });
    this.pageNumber.set(1);
    this.loadGRNs();
  }

  viewDetails(id: string): void {
    this.router.navigate(['/admin/purchasing/grn', id]);
  }

  confirmGRN(id: string): void {
    this.router.navigate(['/admin/purchasing/grn', id, 'confirm']);
  }

  getStatusColor(status: GRNStatus): string {
    switch (status) {
      case GRNStatus.Draft:
        return 'gray';
      case GRNStatus.Confirmed:
        return 'green';
      case GRNStatus.Cancelled:
        return 'red';
      default:
        return 'gray';
    }
  }

  getStatusLabel(status: GRNStatus): string {
    return GRNStatus[status] || 'Unknown';
  }
}

