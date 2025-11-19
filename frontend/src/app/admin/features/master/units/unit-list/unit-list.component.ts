import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { UnitService } from '@core/services/unit.service';
import { ToastService } from '@core/toast/toast.service';
import { UnitDto } from '@core/models/unit.model';

@Component({
  selector: 'grocery-unit-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
  ],
  template: `
    <div class="admin-page-container">
      <div class="admin-page-header">
        <h1>Units</h1>
      </div>

      <mat-card>
        <mat-card-content>
          @if (loading()) {
            <div class="flex justify-center p-8">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (units().length === 0) {
            <div class="text-center py-8 text-gray-500">
              <mat-icon class="text-6xl text-gray-400 mb-4">straighten</mat-icon>
              <p>No units found</p>
            </div>
          } @else {
            <table mat-table [dataSource]="units()" class="w-full">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let unit">{{ unit.name }}</td>
              </ng-container>
              <ng-container matColumnDef="symbol">
                <th mat-header-cell *matHeaderCellDef>Symbol</th>
                <td mat-cell *matCellDef="let unit">{{ unit.symbol }}</td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let unit">{{ getUnitTypeName(unit.type) }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let unit">
                  <mat-chip [color]="unit.isActive ? 'primary' : 'warn'">
                    {{ unit.isActive ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['name', 'symbol', 'type', 'status']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'symbol', 'type', 'status']"></tr>
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
      margin-bottom: 24px;
    }
    .admin-page-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  `]
})
export class UnitListComponent implements OnInit {
  private unitService = inject(UnitService);
  private toastService = inject(ToastService);

  units = signal<UnitDto[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadUnits();
  }

  loadUnits(): void {
    this.loading.set(true);
    this.unitService.getUnits().subscribe({
      next: (units) => {
        this.units.set(units);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load units');
        console.error('Error loading units:', error);
        this.loading.set(false);
      },
    });
  }

  getUnitTypeName(type: number): string {
    const types = ['Kilogram', 'Gram', 'Litre', 'Millilitre', 'Piece', 'Pack', 'Dozen'];
    return types[type] || 'Unknown';
  }
}

