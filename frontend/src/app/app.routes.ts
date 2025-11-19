import { Routes } from '@angular/router';
import { AuthGuard, AdminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/admin/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'admin-imports-legacy',
    loadComponent: () =>
      import('./admin/features/imports/import-upload/import-upload.component').then(m => m.ImportUploadComponent),
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () =>
      import('./admin/features/admin.routes').then(m => m.adminRoutes),
  },
  {
    path: 'pos',
    loadChildren: () =>
      import('./client/features/pos/pos.routes').then(m => m.posRoutes),
  },
  // Redirect old paths to new admin paths for backward compatibility
  {
    path: 'inventory',
    redirectTo: '/admin/inventory',
    pathMatch: 'full',
  },
  {
    path: 'purchasing',
    redirectTo: '/admin/purchasing',
    pathMatch: 'prefix',
  },
  {
    path: 'reports',
    redirectTo: '/admin/reports',
    pathMatch: 'full',
  },
  {
    path: 'settings',
    redirectTo: '/admin/settings',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/admin/dashboard',
  },
];
