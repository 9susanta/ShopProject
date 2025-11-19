import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';

export const suppliersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./suppliers-list/suppliers-list.component').then(m => m.SuppliersListComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./supplier-form/supplier-form.component').then(m => m.SupplierFormComponent),
    canActivate: [AuthGuard],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./supplier-details/supplier-details.component').then(m => m.SupplierDetailsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./supplier-form/supplier-form.component').then(m => m.SupplierFormComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'payments',
    loadComponent: () =>
      import('./supplier-payments/supplier-payments.component').then(m => m.SupplierPaymentsComponent),
    canActivate: [AuthGuard],
  },
];

