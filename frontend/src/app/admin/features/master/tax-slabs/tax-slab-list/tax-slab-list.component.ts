import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaxSlabService } from '@core/services/tax-slab.service';
import { ToastService } from '@core/toast/toast.service';
import { TaxSlabDto } from '@core/models/tax-slab.model';

@Component({
  selector: 'grocery-tax-slab-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="admin-page-container">
      <div class="admin-page-header">
        <h1>Tax Slabs</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="createNewTaxSlab()">
            <mat-icon>add</mat-icon>
            New Tax Slab
          </button>
        </div>
      </div>

      <mat-card>
        <mat-card-content>
          @if (loading()) {
            <div class="flex justify-center p-8">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (taxSlabs().length === 0) {
            <div class="text-center py-8 text-gray-500">
              <mat-icon class="text-6xl text-gray-400 mb-4">percent</mat-icon>
              <p>No tax slabs found</p>
            </div>
          } @else {
            <table mat-table [dataSource]="taxSlabs()" class="w-full">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let taxSlab">
                  <div class="font-semibold">{{ taxSlab.name }}</div>
                </td>
              </ng-container>
              <ng-container matColumnDef="rate">
                <th mat-header-cell *matHeaderCellDef>Rate</th>
                <td mat-cell *matCellDef="let taxSlab">{{ taxSlab.rate }}%</td>
              </ng-container>
              <ng-container matColumnDef="isDefault">
                <th mat-header-cell *matHeaderCellDef>Default</th>
                <td mat-cell *matCellDef="let taxSlab">
                  @if (taxSlab.isDefault) {
                    <mat-chip color="primary">Default</mat-chip>
                  } @else {
                    <span class="text-gray-400">-</span>
                  }
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let taxSlab">
                  <mat-chip [color]="taxSlab.isActive ? 'primary' : 'warn'">
                    {{ taxSlab.isActive ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let taxSlab">
                  <div class="flex gap-2">
                    <button mat-icon-button (click)="editTaxSlab(taxSlab)" matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['name', 'rate', 'isDefault', 'status', 'actions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'rate', 'isDefault', 'status', 'actions']"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .admin-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .admin-page-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  `]
})
export class TaxSlabListComponent implements OnInit {
  private TaxSlabService = inject(TaxSlabService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  taxSlabs = signal<TaxSlabDto[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadTaxSlabs();
  }

  loadTaxSlabs(): void {
    this.loading.set(true);
    this.TaxSlabService.getTaxSlabs().subscribe({
      next: (taxSlabs) => {
        this.taxSlabs.set(taxSlabs);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load tax slabs');
        console.error('Error loading tax slabs:', error);
        this.loading.set(false);
      },
    });
  }

  createNewTaxSlab(): void {
    this.router.navigate(['/admin/master/tax-slabs/new']);
  }

  editTaxSlab(taxSlab: TaxSlabDto): void {
    this.router.navigate(['/admin/master/tax-slabs/edit', taxSlab.id]);
  }
}



