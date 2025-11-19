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
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { CategoryService } from '@core/services/category.service';
import { ToastService } from '@core/toast/toast.service';
import { CategoryDto } from '@core/models/category.model';

@Component({
  selector: 'grocery-category-list',
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
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSelectModule,
  ],
  template: `
    <div class="admin-page-container">
      <div class="admin-page-header">
        <h1>Categories</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="createNewCategory()">
            <mat-icon>add</mat-icon>
            New Category
          </button>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="mb-4">
        <mat-card-content>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="searchTerm" (keyup.enter)="onSearch()" placeholder="Category name..." />
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

      <!-- Categories Table -->
      <mat-card>
        <mat-card-content>
          @if (loading()) {
            <div class="flex justify-center p-8">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (categories().length === 0) {
            <div class="text-center py-8 text-gray-500">
              <mat-icon class="text-6xl text-gray-400 mb-4">label</mat-icon>
              <p>No categories found</p>
            </div>
          } @else {
            <table mat-table [dataSource]="categories()" class="w-full">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let category">
                  <div class="font-semibold">{{ category.name }}</div>
                  @if (category.description) {
                    <div class="text-sm text-gray-500">{{ category.description }}</div>
                  }
                </td>
              </ng-container>
              <ng-container matColumnDef="taxSlab">
                <th mat-header-cell *matHeaderCellDef>Tax Slab</th>
                <td mat-cell *matCellDef="let category">
                  @if (category.taxSlab) {
                    <span>{{ category.taxSlab.name }} ({{ category.taxSlab.rate }}%)</span>
                  } @else {
                    <span class="text-gray-400">-</span>
                  }
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let category">
                  <mat-chip [color]="category.isActive ? 'primary' : 'warn'">
                    {{ category.isActive ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let category">
                  <div class="flex gap-2">
                    <button mat-icon-button (click)="editCategory(category)" matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['name', 'taxSlab', 'status', 'actions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'taxSlab', 'status', 'actions']"></tr>
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
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  categories = signal<CategoryDto[]>([]);
  loading = signal(false);
  searchTerm = '';
  isActiveFilter: boolean | null = null;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getCategories(this.isActiveFilter ?? undefined).subscribe({
      next: (categories) => {
        let filtered = categories;
        if (this.searchTerm.trim()) {
          const term = this.searchTerm.toLowerCase();
          filtered = categories.filter(c => 
            c.name.toLowerCase().includes(term) ||
            c.description?.toLowerCase().includes(term)
          );
        }
        this.categories.set(filtered);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load categories');
        console.error('Error loading categories:', error);
        this.loading.set(false);
      },
    });
  }

  onSearch(): void {
    this.loadCategories();
  }

  onFilterChange(): void {
    this.loadCategories();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.isActiveFilter = null;
    this.loadCategories();
  }

  createNewCategory(): void {
    this.router.navigate(['/admin/master/categories/new']);
  }

  editCategory(category: CategoryDto): void {
    this.router.navigate(['/admin/master/categories/edit', category.id]);
  }
}



