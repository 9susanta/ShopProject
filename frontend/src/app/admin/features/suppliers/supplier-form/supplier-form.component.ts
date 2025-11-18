import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SupplierService } from '@core/services/supplier.service';
import { ToastService } from '@core/toast/toast.service';
import { CreateSupplierRequest, UpdateSupplierRequest } from '@core/models/supplier.model';

@Component({
  selector: 'grocery-supplier-form',
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
    MatProgressSpinnerModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="supplier-form-container p-4 max-w-4xl mx-auto">
      <div class="mb-4">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Suppliers
        </button>
      </div>

      <h1 class="text-2xl font-bold mb-4">{{ isEditMode() ? 'Edit Supplier' : 'Create New Supplier' }}</h1>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <form [formGroup]="supplierForm" (ngSubmit)="onSubmit()">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field appearance="outline" class="md:col-span-2">
                  <mat-label>Supplier Name *</mat-label>
                  <input matInput formControlName="name" required>
                  @if (supplierForm.get('name')?.hasError('required')) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Contact Person</mat-label>
                  <input matInput formControlName="contactPerson">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Phone</mat-label>
                  <input matInput formControlName="phone" type="tel">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email" type="email">
                  @if (supplierForm.get('email')?.hasError('email')) {
                    <mat-error>Invalid email format</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>GST Number</mat-label>
                  <input matInput formControlName="gstNumber" maxlength="15">
                </mat-form-field>

                <mat-form-field appearance="outline" class="md:col-span-2">
                  <mat-label>Address</mat-label>
                  <textarea matInput formControlName="address" rows="3"></textarea>
                </mat-form-field>

                @if (isEditMode()) {
                  <div class="md:col-span-2">
                    <mat-checkbox formControlName="isActive">
                      Active Supplier
                    </mat-checkbox>
                  </div>
                }
              </div>

              <div class="flex justify-end gap-4 mt-6">
                <button mat-button type="button" (click)="goBack()" [disabled]="saving()">
                  Cancel
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="supplierForm.invalid || saving()">
                  @if (saving()) {
                    <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                    {{ isEditMode() ? 'Updating...' : 'Creating...' }}
                  } @else {
                    <mat-icon>{{ isEditMode() ? 'save' : 'add' }}</mat-icon>
                    {{ isEditMode() ? 'Update Supplier' : 'Create Supplier' }}
                  }
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .supplier-form-container {
      min-height: calc(100vh - 64px);
    }
  `]
})
export class SupplierFormComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  loading = signal(false);
  saving = signal(false);
  isEditMode = signal(false);
  supplierId = signal<string | null>(null);
  supplierForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.supplierId.set(id);
      this.loadSupplier(id);
    }
  }

  initForm(): void {
    this.supplierForm = this.fb.group({
      name: ['', [Validators.required]],
      contactPerson: [''],
      phone: [''],
      email: ['', [Validators.email]],
      address: [''],
      gstNumber: [''],
      isActive: [true],
    });
  }

  loadSupplier(id: string): void {
    this.loading.set(true);
    this.supplierService.getSupplierById(id).subscribe({
      next: (supplier) => {
        this.supplierForm.patchValue({
          name: supplier.name,
          contactPerson: supplier.contactPerson || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          address: supplier.address || '',
          gstNumber: supplier.gstNumber || '',
          isActive: supplier.isActive,
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading supplier:', error);
        this.toastService.error('Failed to load supplier');
        this.loading.set(false);
        this.goBack();
      },
    });
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) {
      this.toastService.warning('Please fix form errors');
      return;
    }

    this.saving.set(true);
    const formValue = this.supplierForm.value;

    if (this.isEditMode()) {
      const id = this.supplierId();
      if (!id) return;

      const request: UpdateSupplierRequest = {
        id,
        name: formValue.name,
        contactPerson: formValue.contactPerson || undefined,
        phone: formValue.phone || undefined,
        email: formValue.email || undefined,
        address: formValue.address || undefined,
        gstNumber: formValue.gstNumber || undefined,
        isActive: formValue.isActive,
      };

      this.supplierService.updateSupplier(request).subscribe({
        next: (supplier) => {
          this.toastService.success('Supplier updated successfully');
          this.router.navigate(['/admin/suppliers', supplier.id]);
        },
        error: (error) => {
          console.error('Error updating supplier:', error);
          this.toastService.error(error?.error?.message || 'Failed to update supplier');
          this.saving.set(false);
        },
      });
    } else {
      const request: CreateSupplierRequest = {
        name: formValue.name,
        contactPerson: formValue.contactPerson || undefined,
        phone: formValue.phone || undefined,
        email: formValue.email || undefined,
        address: formValue.address || undefined,
        gstNumber: formValue.gstNumber || undefined,
      };

      this.supplierService.createSupplier(request).subscribe({
        next: (supplier) => {
          this.toastService.success('Supplier created successfully');
          this.router.navigate(['/admin/suppliers', supplier.id]);
        },
        error: (error) => {
          console.error('Error creating supplier:', error);
          this.toastService.error(error?.error?.message || 'Failed to create supplier');
          this.saving.set(false);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/suppliers']);
  }
}

