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
    path: ':id',
    loadComponent: () =>
      import('./customer-details/customer-details.component').then(m => m.CustomerDetailsComponent),
    canActivate: [AuthGuard],
  },
];

