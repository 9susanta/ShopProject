import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/auth.guard';

export const purchasingRoutes: Routes = [
  {
    path: 'purchase-orders',
    loadComponent: () =>
      import('./purchase-order-list/purchase-order-list.component').then(
        (m) => m.PurchaseOrderListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'purchase-orders/new',
    loadComponent: () =>
      import('./purchase-order-form/purchase-order-form.component').then(
        (m) => m.PurchaseOrderFormComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'purchase-orders/:id',
    loadComponent: () =>
      import('./purchase-order-details/purchase-order-details.component').then(
        (m) => m.PurchaseOrderDetailsComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'purchase-orders/:id/edit',
    loadComponent: () =>
      import('./purchase-order-form/purchase-order-form.component').then(
        (m) => m.PurchaseOrderFormComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'grn',
    loadComponent: () =>
      import('./grn-list/grn-list.component').then((m) => m.GRNListComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'grn/new',
    loadComponent: () =>
      import('./grn-form/grn-form.component').then((m) => m.GRNFormComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'grn/:id',
    loadComponent: () =>
      import('./grn-details/grn-details.component').then((m) => m.GRNDetailsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'grn/:id/confirm',
    loadComponent: () =>
      import('./grn-confirm/grn-confirm.component').then((m) => m.GRNConfirmComponent),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'purchase-orders',
    pathMatch: 'full',
  },
];

