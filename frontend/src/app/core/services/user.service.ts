import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserRole } from '@core/models/user.model';

export interface UserListResponse {
  items: User[];
  totalCount: number;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserRequest {
  id: string;
  name: string;
  phone?: string;
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  id: string;
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);

  getUsers(): Observable<User[]> {
    return this.api.get<User[]>('users', {
      cache: true,
      cacheTTL: 30000,
    });
  }

  getUserById(id: string): Observable<User> {
    return this.api.get<User>(`users/${id}`, {
      cache: true,
      cacheTTL: 60000,
    });
  }

  createUser(request: CreateUserRequest): Observable<User> {
    return this.api.post<User>('users', request);
  }

  updateUser(request: UpdateUserRequest): Observable<User> {
    return this.api.put<User>(`users/${request.id}`, request);
  }

  deleteUser(id: string): Observable<void> {
    return this.api.delete<void>(`users/${id}`);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.api.post<void>(`users/${request.id}/change-password`, {
      currentPassword: request.currentPassword,
      newPassword: request.newPassword,
    });
  }

  activateUser(id: string): Observable<User> {
    return this.api.put<User>(`users/${id}`, { id, isActive: true });
  }

  deactivateUser(id: string): Observable<User> {
    return this.api.put<User>(`users/${id}`, { id, isActive: false });
  }
}

