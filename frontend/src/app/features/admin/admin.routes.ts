import { Routes } from '@angular/router';
import { AdminGuard } from '@core/auth/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [AdminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./products/products.routes').then(m => m.productRoutes),
      },
      {
        path: 'imports',
        loadChildren: () =>
          import('./imports/imports.routes').then(m => m.importRoutes),
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('../inventory/inventory.routes').then(m => m.inventoryRoutes),
      },
      {
        path: 'sales',
        loadChildren: () =>
          import('../sales/sales.routes').then(m => m.salesRoutes),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('../customers/customers.routes').then(m => m.customersRoutes),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('../reports/reports.routes').then(m => m.reportsRoutes),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('../settings/settings.routes').then(m => m.settingsRoutes),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

