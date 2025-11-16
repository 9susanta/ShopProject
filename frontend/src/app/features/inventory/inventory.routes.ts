import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/auth.guard';

export const inventoryRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./inventory-list/inventory-list.component').then(m => m.InventoryListComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'adjust',
    loadComponent: () =>
      import('./inventory-adjust/inventory-adjust.component').then(m => m.InventoryAdjustComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'expiry',
    loadComponent: () =>
      import('./expiry-management/expiry-management.component').then(m => m.ExpiryManagementComponent),
    canActivate: [AuthGuard],
  },
];

