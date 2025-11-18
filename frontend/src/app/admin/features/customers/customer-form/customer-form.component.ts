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
import { CustomerService } from '@core/services/customer.service';
import { CreateCustomerRequest, UpdateCustomerRequest } from '@core/models/customer.model';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'grocery-customer-form',
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
    <div class="customer-form-container p-4 max-w-4xl mx-auto">
      <div class="mb-4">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Customers
        </button>
      </div>

      <h1 class="text-2xl font-bold mb-4">{{ isEditMode() ? 'Edit Customer' : 'Create New Customer' }}</h1>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <form [formGroup]="customerForm" (ngSubmit)="onSubmit()">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field appearance="outline" class="md:col-span-2">
                  <mat-label>Name *</mat-label>
                  <input matInput formControlName="name" required>
                  @if (customerForm.get('name')?.hasError('required')) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Phone *</mat-label>
                  <input matInput formControlName="phone" type="tel" required maxlength="15">
                  @if (customerForm.get('phone')?.hasError('required')) {
                    <mat-error>Phone is required</mat-error>
                  }
                  @if (customerForm.get('phone')?.hasError('pattern')) {
                    <mat-error>Invalid phone number format</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email" type="email">
                  @if (customerForm.get('email')?.hasError('email')) {
                    <mat-error>Invalid email format</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="md:col-span-2">
                  <mat-label>Address</mat-label>
                  <textarea matInput formControlName="address" rows="2"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>City</mat-label>
                  <input matInput formControlName="city">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>State</mat-label>
                  <input matInput formControlName="state">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Pincode</mat-label>
                  <input matInput formControlName="pincode" maxlength="10">
                </mat-form-field>

                <div class="md:col-span-2">
                  <mat-checkbox formControlName="isActive">
                    Active Customer
                  </mat-checkbox>
                </div>
              </div>

              <div class="flex justify-end gap-4 mt-6">
                <button mat-button type="button" (click)="goBack()" [disabled]="saving()">
                  Cancel
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="customerForm.invalid || saving()">
                  @if (saving()) {
                    <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                    {{ isEditMode() ? 'Updating...' : 'Creating...' }}
                  } @else {
                    <mat-icon>{{ isEditMode() ? 'save' : 'add' }}</mat-icon>
                    {{ isEditMode() ? 'Update Customer' : 'Create Customer' }}
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
    .customer-form-container {
      min-height: calc(100vh - 64px);
    }
  `]
})
export class CustomerFormComponent implements OnInit {
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  loading = signal(false);
  saving = signal(false);
  isEditMode = signal(false);
  customerId = signal<string | null>(null);
  customerForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.customerId.set(id);
      this.loadCustomer(id);
    }
  }

  initForm(): void {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      email: ['', [Validators.email]],
      address: [''],
      city: [''],
      state: [''],
      pincode: [''],
      isActive: [true],
    });
  }

  loadCustomer(id: string): void {
    this.loading.set(true);
    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customerForm.patchValue({
          name: customer.name,
          phone: customer.phone,
          email: customer.email || '',
          address: customer.address || '',
          city: customer.city || '',
          state: customer.state || '',
          pincode: customer.pincode || '',
          isActive: customer.isActive,
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        this.toastService.error('Failed to load customer');
        this.loading.set(false);
        this.goBack();
      },
    });
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.toastService.warning('Please fix form errors');
      return;
    }

    this.saving.set(true);
    const formValue = this.customerForm.value;

    if (this.isEditMode()) {
      const id = this.customerId();
      if (!id) return;

      const request: UpdateCustomerRequest = {
        id,
        name: formValue.name,
        phone: formValue.phone,
        email: formValue.email || undefined,
        address: formValue.address || undefined,
        city: formValue.city || undefined,
        state: formValue.state || undefined,
        pincode: formValue.pincode || undefined,
        isActive: formValue.isActive,
      };

      this.customerService.updateCustomer(request).subscribe({
        next: (customer) => {
          this.toastService.success('Customer updated successfully');
          this.router.navigate(['/admin/customers', customer.id]);
        },
        error: (error) => {
          console.error('Error updating customer:', error);
          this.toastService.error(error?.error?.message || 'Failed to update customer');
          this.saving.set(false);
        },
      });
    } else {
      const request: CreateCustomerRequest = {
        name: formValue.name,
        phone: formValue.phone,
        email: formValue.email || undefined,
        address: formValue.address || undefined,
        city: formValue.city || undefined,
        state: formValue.state || undefined,
        pincode: formValue.pincode || undefined,
      };

      this.customerService.createCustomer(request).subscribe({
        next: (customer) => {
          this.toastService.success('Customer created successfully');
          this.router.navigate(['/admin/customers', customer.id]);
        },
        error: (error) => {
          console.error('Error creating customer:', error);
          this.toastService.error(error?.error?.message || 'Failed to create customer');
          this.saving.set(false);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/customers']);
  }
}

