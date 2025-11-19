import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';

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
  {
    path: ':id/return',
    loadComponent: () =>
      import('./sale-return-form/sale-return-form.component').then(m => m.SaleReturnFormComponent),
    canActivate: [AuthGuard],
  },
];

