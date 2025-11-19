import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoryService } from '@core/services/category.service';
import { TaxSlabService } from '@core/services/tax-slab.service';
import { ToastService } from '@core/toast/toast.service';
import { CategoryCreateRequest, CategoryUpdateRequest } from '@core/models/category.model';
import { TaxSlabDto } from '@core/models/tax-slab.model';

@Component({
  selector: 'grocery-category-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="admin-page-container">
      <div class="admin-page-header">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Categories
        </button>
      </div>

      <h1 class="text-2xl font-bold mb-4">{{ isEditMode() ? 'Edit Category' : 'Create New Category' }}</h1>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field appearance="outline" class="md:col-span-2">
                  <mat-label>Category Name *</mat-label>
                  <input matInput formControlName="name" required>
                  @if (categoryForm.get('name')?.hasError('required')) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="md:col-span-2">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="3"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline" class="md:col-span-2">
                  <mat-label>Tax Slab *</mat-label>
                  <mat-select formControlName="taxSlabId" required>
                    @for (taxSlab of taxSlabs(); track taxSlab.id) {
                      <mat-option [value]="taxSlab.id">
                        {{ taxSlab.name }} ({{ taxSlab.rate }}%)
                      </mat-option>
                    }
                  </mat-select>
                  @if (categoryForm.get('taxSlabId')?.hasError('required')) {
                    <mat-error>Tax Slab is required</mat-error>
                  }
                </mat-form-field>
              </div>

              <div class="flex justify-end gap-4 mt-6">
                <button mat-button type="button" (click)="goBack()" [disabled]="saving()">
                  Cancel
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="categoryForm.invalid || saving()">
                  @if (saving()) {
                    <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                  }
                  {{ isEditMode() ? 'Update' : 'Create' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .admin-page-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    .admin-page-header {
      margin-bottom: 16px;
    }
  `]
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private TaxSlabService = inject(TaxSlabService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  categoryForm: FormGroup;
  isEditMode = signal(false);
  categoryId = signal<string | null>(null);
  loading = signal(false);
  saving = signal(false);
  taxSlabs = signal<TaxSlabDto[]>([]);

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      taxSlabId: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadTaxSlabs();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.categoryId.set(id);
      this.loadCategory(id);
    }
  }

  loadTaxSlabs(): void {
    this.TaxSlabService.getTaxSlabs().subscribe({
      next: (taxSlabs) => {
        this.taxSlabs.set(taxSlabs);
      },
      error: (error) => {
        console.error('Error loading tax slabs:', error);
      },
    });
  }

  loadCategory(id: string): void {
    this.loading.set(true);
    this.categoryService.getCategoryById(id).subscribe({
      next: (category) => {
        this.categoryForm.patchValue({
          name: category.name,
          description: category.description || '',
          taxSlabId: category.taxSlabId,
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load category');
        console.error('Error loading category:', error);
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    this.saving.set(true);
    const formValue = this.categoryForm.value;

    if (this.isEditMode()) {
      const request: CategoryUpdateRequest = {
        id: this.categoryId()!,
        name: formValue.name.trim(),
        description: formValue.description?.trim() || undefined,
        taxSlabId: formValue.taxSlabId,
      };

      this.categoryService.updateCategory(request).subscribe({
        next: () => {
          this.toastService.success('Category updated successfully');
          this.router.navigate(['/admin/master/categories']);
        },
        error: (error) => {
          this.toastService.error('Failed to update category');
          console.error('Error updating category:', error);
          this.saving.set(false);
        },
      });
    } else {
      const request: CategoryCreateRequest = {
        name: formValue.name.trim(),
        description: formValue.description?.trim() || undefined,
        taxSlabId: formValue.taxSlabId,
      };

      this.categoryService.createCategory(request).subscribe({
        next: () => {
          this.toastService.success('Category created successfully');
          this.router.navigate(['/admin/master/categories']);
        },
        error: (error) => {
          this.toastService.error('Failed to create category');
          console.error('Error creating category:', error);
          this.saving.set(false);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/master/categories']);
  }
}



