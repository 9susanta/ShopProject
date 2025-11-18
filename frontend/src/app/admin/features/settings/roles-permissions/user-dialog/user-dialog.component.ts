import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User, UserRole } from '@core/models/user.model';

export interface UserDialogData {
  user?: User;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'grocery-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.mode === 'create' ? 'person_add' : 'edit' }}</mat-icon>
      {{ data.mode === 'create' ? 'Create User' : 'Edit User' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Name *</mat-label>
          <input matInput formControlName="name" placeholder="Enter full name" required />
          <mat-icon matPrefix>person</mat-icon>
          @if (userForm.get('name')?.hasError('required') && userForm.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        @if (data.mode === 'create') {
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email *</mat-label>
            <input matInput type="email" formControlName="email" placeholder="Enter email address" required />
            <mat-icon matPrefix>email</mat-icon>
            @if (userForm.get('email')?.hasError('required') && userForm.get('email')?.touched) {
              <mat-error>Email is required</mat-error>
            }
            @if (userForm.get('email')?.hasError('email') && userForm.get('email')?.touched) {
              <mat-error>Invalid email format</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Password *</mat-label>
            <input matInput type="password" formControlName="password" placeholder="Enter password" required />
            <mat-icon matPrefix>lock</mat-icon>
            @if (userForm.get('password')?.hasError('required') && userForm.get('password')?.touched) {
              <mat-error>Password is required</mat-error>
            }
            @if (userForm.get('password')?.hasError('minlength') && userForm.get('password')?.touched) {
              <mat-error>Password must be at least 6 characters</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Role *</mat-label>
            <mat-select formControlName="role" required>
              <mat-option value="Staff">Staff</mat-option>
              <mat-option value="Admin">Admin</mat-option>
              <mat-option value="SuperAdmin">SuperAdmin</mat-option>
            </mat-select>
            <mat-icon matPrefix>admin_panel_settings</mat-icon>
            @if (userForm.get('role')?.hasError('required') && userForm.get('role')?.touched) {
              <mat-error>Role is required</mat-error>
            }
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" placeholder="Enter phone number (optional)" />
          <mat-icon matPrefix>phone</mat-icon>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="userForm.invalid || submitting()"
      >
        @if (submitting()) {
          <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
        }
        {{ data.mode === 'create' ? 'Create' : 'Update' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
      padding: 16px 0;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-dialog-content {
      padding: 24px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
    }

    .w-full {
      width: 100%;
    }
  `],
})
export class UserDialogComponent {
  userForm: FormGroup;
  submitting = signal(false);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    this.userForm = this.fb.group({
      name: [data.user?.name || '', Validators.required],
      email: [data.user?.email || '', [Validators.required, Validators.email]],
      password: [data.mode === 'create' ? '' : '********', data.mode === 'create' ? [Validators.required, Validators.minLength(6)] : []],
      role: [data.user?.role || 'Staff', Validators.required],
      phone: [data.user?.phone || ''],
    });

    if (data.mode === 'edit') {
      this.userForm.get('email')?.disable();
      this.userForm.get('password')?.disable();
      this.userForm.get('role')?.disable();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.submitting.set(true);
    const formValue = this.userForm.getRawValue();
    
    if (this.data.mode === 'edit') {
      // For edit, only send name and phone
      this.dialogRef.close({
        id: this.data.user?.id,
        name: formValue.name,
        phone: formValue.phone || undefined,
      });
    } else {
      // For create, send all fields
      this.dialogRef.close({
        name: formValue.name,
        email: formValue.email,
        password: formValue.password,
        role: formValue.role as UserRole,
        phone: formValue.phone || undefined,
      });
    }
  }
}

