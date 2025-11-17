import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/auth.guard';

export const salesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sales-list/sales-list.component').then(m => m.SalesListComponent),
    canActivate: [AuthGuard],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./sale-details/sale-details.component').then(m => m.SaleDetailsComponent),
    canActivate: [AuthGuard],
  },
];

