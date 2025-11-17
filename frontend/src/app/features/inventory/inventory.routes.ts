import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/auth.guard';

export const inventoryRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./inventory-dashboard/inventory-dashboard.component').then(m => m.InventoryDashboardComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./product-batch-list/product-batch-list.component').then(m => m.ProductBatchListComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'product/:productId',
    loadComponent: () =>
      import('./batch-details/batch-details.component').then(m => m.BatchDetailsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'product/:productId/batches',
    loadComponent: () =>
      import('./batch-details/batch-details.component').then(m => m.BatchDetailsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'low-stock',
    loadComponent: () =>
      import('./low-stock-list/low-stock-list.component').then(m => m.LowStockListComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'expiry',
    loadComponent: () =>
      import('./expiry-list/expiry-list.component').then(m => m.ExpiryListComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'adjust',
    loadComponent: () =>
      import('./inventory-adjust/inventory-adjust.component').then(m => m.InventoryAdjustComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./inventory-list/inventory-list.component').then(m => m.InventoryListComponent),
    canActivate: [AuthGuard],
  },
];

