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
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.adminRoutes),
  },
  {
    path: 'pos',
    loadChildren: () =>
      import('./features/pos/pos.routes').then(m => m.posRoutes),
  },
  {
    path: 'inventory',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/inventory/inventory.routes').then(m => m.inventoryRoutes),
  },
  {
    path: 'purchasing',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/purchasing/purchasing.routes').then(m => m.purchasingRoutes),
  },
  {
    path: 'reports',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/reports/reports.routes').then(m => m.reportsRoutes),
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/settings/settings.routes').then(m => m.settingsRoutes),
  },
  {
    path: 'inventory/adjustments',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/adjustments/adjustments.routes').then(m => m.adjustmentsRoutes),
  },
  {
    path: 'admin/audit',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/audit/audit.routes').then(m => m.auditRoutes),
  },
  {
    path: '**',
    redirectTo: '/admin/dashboard',
  },
];
