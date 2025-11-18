import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PermissionService, Permission, RolePermission } from '@core/services/permission.service';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'grocery-permissions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="permissions-container p-4 max-w-6xl mx-auto">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Role Permissions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="mb-4">
            <mat-form-field>
              <mat-label>Select Role</mat-label>
              <mat-select [value]="selectedRole()" (selectionChange)="onRoleSelected($event.value)">
                <mat-option value="Admin">Admin</mat-option>
                <mat-option value="Staff">Staff</mat-option>
                <mat-option value="SuperAdmin">SuperAdmin</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          @if (loading()) {
            <div class="flex justify-center p-8">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else {
            <table mat-table [dataSource]="permissions()" class="w-full">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Permission</th>
                <td mat-cell *matCellDef="let permission">{{ permission.name }}</td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let permission">{{ permission.description }}</td>
              </ng-container>

              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Category</th>
                <td mat-cell *matCellDef="let permission">{{ permission.category }}</td>
              </ng-container>

              <ng-container matColumnDef="assigned">
                <th mat-header-cell *matHeaderCellDef>Assigned</th>
                <td mat-cell *matCellDef="let permission">
                  <mat-checkbox
                    [checked]="isPermissionAssigned(permission.id)"
                    (change)="togglePermission(permission.id, $event.checked)"
                  ></mat-checkbox>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['name', 'description', 'category', 'assigned']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'description', 'category', 'assigned']"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .permissions-container {
      min-height: calc(100vh - 64px);
    }
  `]
})
export class PermissionsComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private toastService = inject(ToastService);

  permissions = signal<Permission[]>([]);
  rolePermissions = signal<RolePermission | null>(null);
  selectedRole = signal<string>('Admin');
  loading = signal(false);
  assignedPermissionIds = signal<Set<string>>(new Set());

  displayedColumns: string[] = ['name', 'description', 'category', 'assigned'];

  ngOnInit(): void {
    this.loadPermissions();
    this.loadRolePermissions(this.selectedRole());
  }

  loadPermissions(): void {
    this.loading.set(true);
    this.permissionService.getPermissions().subscribe({
      next: (response) => {
        this.permissions.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.toastService.error('Failed to load permissions');
        this.loading.set(false);
      },
    });
  }

  loadRolePermissions(roleName: string): void {
    this.permissionService.getRolePermissions(roleName).subscribe({
      next: (response) => {
        this.rolePermissions.set(response);
        this.assignedPermissionIds.set(new Set(response.permissions.map(p => p.id)));
      },
      error: (error) => {
        console.error('Error loading role permissions:', error);
        this.toastService.error('Failed to load role permissions');
      },
    });
  }

  onRoleSelected(roleName: string): void {
    this.selectedRole.set(roleName);
    this.loadRolePermissions(roleName);
  }

  isPermissionAssigned(permissionId: string): boolean {
    return this.assignedPermissionIds().has(permissionId);
  }

  togglePermission(permissionId: string, checked: boolean): void {
    if (checked) {
      this.permissionService.assignPermission(this.selectedRole(), permissionId).subscribe({
        next: () => {
          this.assignedPermissionIds.update(ids => new Set([...ids, permissionId]));
          this.toastService.success('Permission assigned');
        },
        error: (error) => {
          console.error('Error assigning permission:', error);
          this.toastService.error('Failed to assign permission');
        },
      });
    } else {
      // TODO: Implement remove permission endpoint
      this.toastService.info('Remove permission feature coming soon');
    }
  }
}

