import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
}

export interface RolePermission {
  roleName: string;
  permissions: Permission[];
}

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/permissions`;

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiUrl);
  }

  getRolePermissions(roleName: string): Observable<RolePermission> {
    return this.http.get<RolePermission>(`${this.apiUrl}/role/${roleName}`);
  }

  getMyPermissions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/me`);
  }

  assignPermission(roleName: string, permissionId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/assign`, {
      roleName,
      permissionId,
    });
  }
}

