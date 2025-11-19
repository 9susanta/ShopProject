import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaxSlabService } from '@core/services/tax-slab.service';
import { ToastService } from '@core/toast/toast.service';
import { TaxSlabCreateRequest, TaxSlabUpdateRequest } from '@core/models/tax-slab.model';

@Component({
  selector: 'grocery-tax-slab-form',
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
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="admin-page-container">
      <div class="admin-page-header">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Tax Slabs
        </button>
      </div>

      <h1 class="text-2xl font-bold mb-4">{{ isEditMode() ? 'Edit Tax Slab' : 'Create New Tax Slab' }}</h1>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <form [formGroup]="taxSlabForm" (ngSubmit)="onSubmit()">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field appearance="outline" class="md:col-span-2">
                  <mat-label>Tax Slab Name *</mat-label>
                  <input matInput formControlName="name" required>
                  @if (taxSlabForm.get('name')?.hasError('required')) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tax Rate (%) *</mat-label>
                  <input matInput type="number" formControlName="rate" required min="0" max="100" step="0.01">
                  @if (taxSlabForm.get('rate')?.hasError('required')) {
                    <mat-error>Rate is required</mat-error>
                  }
                  @if (taxSlabForm.get('rate')?.hasError('min') || taxSlabForm.get('rate')?.hasError('max')) {
                    <mat-error>Rate must be between 0 and 100</mat-error>
                  }
                </mat-form-field>

                <div class="flex items-center">
                  <mat-checkbox formControlName="isDefault">
                    Set as Default Tax Slab
                  </mat-checkbox>
                </div>
              </div>

              <div class="flex justify-end gap-4 mt-6">
                <button mat-button type="button" (click)="goBack()" [disabled]="saving()">
                  Cancel
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="taxSlabForm.invalid || saving()">
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
export class TaxSlabFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private TaxSlabService = inject(TaxSlabService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  taxSlabForm: FormGroup;
  isEditMode = signal(false);
  taxSlabId = signal<string | null>(null);
  loading = signal(false);
  saving = signal(false);

  constructor() {
    this.taxSlabForm = this.fb.group({
      name: ['', [Validators.required]],
      rate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      isDefault: [false],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.taxSlabId.set(id);
      this.loadTaxSlab(id);
    }
  }

  loadTaxSlab(id: string): void {
    this.loading.set(true);
    // Note: TaxSlabService doesn't have getById, so we'll need to get all and find
    this.TaxSlabService.getTaxSlabs().subscribe({
      next: (taxSlabs) => {
        const taxSlab = taxSlabs.find(t => t.id === id);
        if (taxSlab) {
          this.taxSlabForm.patchValue({
            name: taxSlab.name,
            rate: taxSlab.rate,
            isDefault: taxSlab.isDefault,
          });
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load tax slab');
        console.error('Error loading tax slab:', error);
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.taxSlabForm.invalid) {
      return;
    }

    this.saving.set(true);
    const formValue = this.taxSlabForm.value;

    if (this.isEditMode()) {
      const request: TaxSlabUpdateRequest = {
        id: this.taxSlabId()!,
        name: formValue.name.trim(),
        rate: parseFloat(formValue.rate),
        isDefault: formValue.isDefault || false,
      };

      this.TaxSlabService.updateTaxSlab(request).subscribe({
        next: () => {
          this.toastService.success('Tax slab updated successfully');
          this.router.navigate(['/admin/master/tax-slabs']);
        },
        error: (error) => {
          this.toastService.error('Failed to update tax slab');
          console.error('Error updating tax slab:', error);
          this.saving.set(false);
        },
      });
    } else {
      const request: TaxSlabCreateRequest = {
        name: formValue.name.trim(),
        rate: parseFloat(formValue.rate),
        isDefault: formValue.isDefault || false,
      };

      this.TaxSlabService.createTaxSlab(request).subscribe({
        next: () => {
          this.toastService.success('Tax slab created successfully');
          this.router.navigate(['/admin/master/tax-slabs']);
        },
        error: (error) => {
          this.toastService.error('Failed to create tax slab');
          console.error('Error creating tax slab:', error);
          this.saving.set(false);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/master/tax-slabs']);
  }
}



