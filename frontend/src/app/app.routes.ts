import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { AdminGuard } from './core/auth/admin.guard';

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
      import('./admin/features/admin/imports/import-upload/import-upload.component').then(m => m.ImportUploadComponent),
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () =>
      import('./admin/features/admin/admin.routes').then(m => m.adminRoutes),
  },
  {
    path: 'pos',
    loadChildren: () =>
      import('./client/features/pos/pos.routes').then(m => m.posRoutes),
  },
  {
    path: 'inventory',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./admin/features/inventory/inventory.routes').then(m => m.inventoryRoutes),
  },
  {
    path: 'purchasing',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./admin/features/purchasing/purchasing.routes').then(m => m.purchasingRoutes),
  },
  {
    path: 'reports',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./admin/features/reports/reports.routes').then(m => m.reportsRoutes),
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./admin/features/settings/settings.routes').then(m => m.settingsRoutes),
  },
  {
    path: 'inventory/adjustments',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./admin/features/adjustments/adjustments.routes').then(m => m.adjustmentsRoutes),
  },
  {
    path: 'admin/audit',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./admin/features/audit/audit.routes').then(m => m.auditRoutes),
  },
  {
    path: '**',
    redirectTo: '/admin/dashboard',
  },
];
