import { Routes } from '@angular/router';
import { AdminGuard } from '@core/auth/admin.guard';
import { AuthGuard } from '@core/auth/auth.guard';

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
        path: 'purchasing',
        loadChildren: () =>
          import('../purchasing/purchasing.routes').then(m => m.purchasingRoutes),
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
        path: 'inventory/adjustments',
        loadChildren: () =>
          import('../adjustments/adjustments.routes').then(m => m.adjustmentsRoutes),
      },
      {
        path: 'audit',
        loadChildren: () =>
          import('../audit/audit.routes').then(m => m.auditRoutes),
      },
      {
        path: 'accounting',
        loadChildren: () =>
          import('../accounting/accounting.routes').then(m => m.accountingRoutes),
      },
      {
        path: 'offers',
        loadChildren: () =>
          import('./offers/offers.routes').then(m => m.offerRoutes),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [AdminGuard],
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

