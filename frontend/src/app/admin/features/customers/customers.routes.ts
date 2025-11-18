import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/auth.guard';

export const customersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./customers-list/customers-list.component').then(m => m.CustomersListComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./customer-form/customer-form.component').then(m => m.CustomerFormComponent),
    canActivate: [AuthGuard],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./customer-details/customer-details.component').then(m => m.CustomerDetailsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./customer-form/customer-form.component').then(m => m.CustomerFormComponent),
    canActivate: [AuthGuard],
  },
];

