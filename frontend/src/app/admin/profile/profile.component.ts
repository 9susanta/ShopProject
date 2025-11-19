import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { UserService, ChangePasswordRequest } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/toast/toast.service';
import { User } from '@core/models/user.model';

@Component({
  selector: 'grocery-profile',
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
    MatDividerModule,
    MatDialogModule,
  ],
  template: `
    <div class="profile-container p-4 max-w-4xl mx-auto">
      <div class="mb-4">
        <button mat-button routerLink="/admin/dashboard">
          <mat-icon>arrow_back</mat-icon>
          Back to Dashboard
        </button>
      </div>

      <h1 class="text-2xl font-bold mb-4">My Profile</h1>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (user()) {
        <!-- Profile Information -->
        <mat-card class="mb-4">
          <mat-card-header>
            <mat-card-title>Profile Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field appearance="outline" class="md:col-span-2">
                  <mat-label>Email</mat-label>
                  <input matInput [value]="user()!.email" disabled>
                  <mat-hint>Email cannot be changed</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Name</mat-label>
                  <input matInput formControlName="name" required>
                  @if (profileForm.get('name')?.hasError('required')) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Phone</mat-label>
                  <input matInput formControlName="phone" type="tel">
                </mat-form-field>

                <mat-form-field appearance="outline" class="md:col-span-2">
                  <mat-label>Role</mat-label>
                  <input matInput [value]="user()!.role" disabled>
                </mat-form-field>
              </div>

              <div class="flex justify-end gap-4 mt-4">
                <button mat-button type="button" (click)="resetForm()" [disabled]="saving()">
                  Cancel
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || saving()">
                  @if (saving()) {
                    <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                    Saving...
                  } @else {
                    <mat-icon>save</mat-icon>
                    Save Changes
                  }
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Change Password -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Change Password</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
              <div class="grid grid-cols-1 gap-4">
                <mat-form-field appearance="outline">
                  <mat-label>Current Password</mat-label>
                  <input matInput type="password" formControlName="currentPassword" required>
                  @if (passwordForm.get('currentPassword')?.hasError('required')) {
                    <mat-error>Current password is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>New Password</mat-label>
                  <input matInput type="password" formControlName="newPassword" required minlength="6">
                  @if (passwordForm.get('newPassword')?.hasError('required')) {
                    <mat-error>New password is required</mat-error>
                  }
                  @if (passwordForm.get('newPassword')?.hasError('minlength')) {
                    <mat-error>Password must be at least 6 characters</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Confirm New Password</mat-label>
                  <input matInput type="password" formControlName="confirmPassword" required>
                  @if (passwordForm.get('confirmPassword')?.hasError('required')) {
                    <mat-error>Please confirm your password</mat-error>
                  }
                  @if (passwordForm.hasError('passwordMismatch')) {
                    <mat-error>Passwords do not match</mat-error>
                  }
                </mat-form-field>
              </div>

              <div class="flex justify-end gap-4 mt-4">
                <button mat-button type="button" (click)="resetPasswordForm()" [disabled]="changingPassword()">
                  Cancel
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="passwordForm.invalid || changingPassword()">
                  @if (changingPassword()) {
                    <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                    Changing...
                  } @else {
                    <mat-icon>lock</mat-icon>
                    Change Password
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
    .profile-container {
      min-height: calc(100vh - 64px);
    }
  `]
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  loading = signal(false);
  saving = signal(false);
  changingPassword = signal(false);
  user = signal<User | null>(null);
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  ngOnInit(): void {
    this.initForms();
    this.loadUser();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      phone: [''],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  loadUser(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.toastService.error('User not found');
      return;
    }

    this.loading.set(true);
    this.userService.getUserById(currentUser.id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.profileForm.patchValue({
          name: user.name,
          phone: user.phone || '',
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.toastService.error('Failed to load user profile');
        this.loading.set(false);
      },
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.toastService.warning('Please fix form errors');
      return;
    }

    this.saving.set(true);
    const user = this.user();
    if (!user) return;

    const request = {
      id: user.id,
      name: this.profileForm.value.name,
      phone: this.profileForm.value.phone || undefined,
    };

    this.userService.updateUser(request).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        // Update stored user in localStorage to sync with auth service
        if (typeof window !== 'undefined' && window.localStorage) {
          const currentUser = this.authService.getCurrentUser();
          if (currentUser && currentUser.id === updatedUser.id) {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
        this.toastService.success('Profile updated successfully');
        this.saving.set(false);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.toastService.error(error?.error?.message || 'Failed to update profile');
        this.saving.set(false);
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.toastService.warning('Please fix form errors');
      return;
    }

    const user = this.user();
    if (!user) return;

    const request: ChangePasswordRequest = {
      id: user.id,
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
    };

    this.changingPassword.set(true);
    this.userService.changePassword(request).subscribe({
      next: () => {
        this.toastService.success('Password changed successfully');
        this.resetPasswordForm();
        this.changingPassword.set(false);
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.toastService.error(error?.error?.message || 'Failed to change password');
        this.changingPassword.set(false);
      },
    });
  }

  resetForm(): void {
    const user = this.user();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        phone: user.phone || '',
      });
    }
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
  }
}

