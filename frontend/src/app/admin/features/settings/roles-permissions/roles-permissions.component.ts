import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService, CreateUserRequest, UpdateUserRequest } from '@core/services/user.service';
import { ToastService } from '@core/toast/toast.service';
import { AuthService } from '@core/services/auth.service';
import { User, UserRole } from '@core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'grocery-roles-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  template: `
    <div class="roles-permissions-container p-4 max-w-7xl mx-auto">
      <div class="mb-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">User Management</h1>
          <p class="text-gray-600">Manage users, roles, and permissions</p>
        </div>
        @if (canCreateUser()) {
          <button mat-raised-button color="primary" (click)="openCreateUserDialog()">
            <mat-icon>add</mat-icon>
            Create User
          </button>
        }
      </div>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (users().length > 0) {
        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="users()" class="w-full">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let user">
                  <div>
                    <div class="font-semibold">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [color]="getRoleColor(user.role)">
                    {{ user.role }}
                  </mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let user">{{ user.phone || 'N/A' }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [color]="user.isActive ? 'primary' : 'warn'">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="lastLogin">
                <th mat-header-cell *matHeaderCellDef>Last Login</th>
                <td mat-cell *matCellDef="let user">
                  {{ user.lastLoginAt ? (user.lastLoginAt | date: 'short') : 'Never' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user">
                  <div class="flex gap-2">
                    @if (canEditUser(user)) {
                      <button mat-icon-button (click)="editUser(user)" matTooltip="Edit User">
                        <mat-icon>edit</mat-icon>
                      </button>
                    }
                    @if (canToggleUserStatus(user)) {
                      <button 
                        mat-icon-button 
                        [color]="user.isActive ? 'warn' : 'primary'"
                        (click)="toggleUserStatus(user)"
                        [matTooltip]="user.isActive ? 'Deactivate' : 'Activate'">
                        <mat-icon>{{ user.isActive ? 'block' : 'check_circle' }}</mat-icon>
                      </button>
                    }
                    @if (canDeleteUser(user)) {
                      <button mat-icon-button color="warn" (click)="deleteUser(user)" matTooltip="Delete User">
                        <mat-icon>delete</mat-icon>
                      </button>
                    }
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['name', 'role', 'phone', 'status', 'lastLogin', 'actions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'role', 'phone', 'status', 'lastLogin', 'actions']"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="text-center py-8 text-gray-500">No users found</div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .roles-permissions-container {
      min-height: calc(100vh - 64px);
    }
  `]
})
export class RolesPermissionsComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  loading = signal(false);
  users = signal<User[]>([]);
  currentUser = signal<User | null>(null);

  displayedColumns = ['name', 'role', 'phone', 'status', 'lastLogin', 'actions'];

  ngOnInit(): void {
    this.currentUser.set(this.authService.getCurrentUser());
    this.loadUsers();
  }

  canCreateUser = signal(true); // Admin and SuperAdmin can create users
  canEditUser = (user: User) => {
    const current = this.currentUser();
    if (!current) return false;
    // SuperAdmin can edit anyone, Admin can edit Staff only
    if (current.role === 'SuperAdmin') return true;
    if (current.role === 'Admin' && user.role === 'Staff') return true;
    return false;
  };
  canToggleUserStatus = (user: User) => {
    const current = this.currentUser();
    if (!current) return false;
    // Can't deactivate yourself
    if (current.id === user.id) return false;
    // SuperAdmin can toggle anyone, Admin can toggle Staff only
    if (current.role === 'SuperAdmin') return true;
    if (current.role === 'Admin' && user.role === 'Staff') return true;
    return false;
  };
  canDeleteUser = (user: User) => {
    const current = this.currentUser();
    if (!current) return false;
    // Can't delete yourself
    if (current.id === user.id) return false;
    // Only SuperAdmin can delete users
    if (current.role === 'SuperAdmin') return true;
    return false;
  };

  getRoleColor(role: string): 'primary' | 'accent' | 'warn' {
    switch (role) {
      case 'SuperAdmin':
        return 'warn';
      case 'Admin':
        return 'primary';
      case 'Staff':
        return 'accent';
      default:
        return 'primary';
    }
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.toastService.error('Failed to load users');
        this.loading.set(false);
      },
    });
  }

  openCreateUserDialog(): void {
    // Simple prompt for now - can be enhanced with a proper dialog component
    const email = prompt('Enter email:');
    if (!email) return;

    const name = prompt('Enter name:');
    if (!name) return;

    const password = prompt('Enter password:');
    if (!password) return;

    const roleStr = prompt('Enter role (SuperAdmin/Admin/Staff):');
    if (!roleStr) return;

    const role = roleStr as UserRole;
    if (!['SuperAdmin', 'Admin', 'Staff'].includes(role)) {
      this.toastService.error('Invalid role');
      return;
    }

    const phone = prompt('Enter phone (optional):') || undefined;

    const request: CreateUserRequest = {
      email,
      name,
      password,
      role,
      phone,
    };

    this.userService.createUser(request).subscribe({
      next: () => {
        this.toastService.success('User created successfully');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.toastService.error(error?.error?.message || 'Failed to create user');
      },
    });
  }

  editUser(user: User): void {
    const name = prompt('Enter new name:', user.name);
    if (!name) return;

    const phone = prompt('Enter phone (optional):', user.phone || '') || undefined;

    const request: UpdateUserRequest = {
      id: user.id,
      name,
      phone,
    };

    this.userService.updateUser(request).subscribe({
      next: () => {
        this.toastService.success('User updated successfully');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.toastService.error(error?.error?.message || 'Failed to update user');
      },
    });
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `${action === 'activate' ? 'Activate' : 'Deactivate'} User`,
        message: `Are you sure you want to ${action} ${user.name}?`,
        confirmText: action === 'activate' ? 'Activate' : 'Deactivate',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const serviceCall = user.isActive
          ? this.userService.deactivateUser(user.id)
          : this.userService.activateUser(user.id);

        serviceCall.subscribe({
          next: () => {
            this.toastService.success(`User ${action}d successfully`);
            this.loadUsers();
          },
          error: (error) => {
            console.error(`Error ${action}ing user:`, error);
            this.toastService.error(error?.error?.message || `Failed to ${action} user`);
          },
        });
      }
    });
  }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.toastService.success('User deleted successfully');
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.toastService.error(error?.error?.message || 'Failed to delete user');
          },
        });
      }
    });
  }
}
