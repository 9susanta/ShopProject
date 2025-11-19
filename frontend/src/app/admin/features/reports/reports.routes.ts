import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';

export const reportsRoutes: Routes = [
  {
    path: 'gst-export',
    loadComponent: () =>
      import('./gst-export/gst-export.component').then(m => m.GSTExportComponent),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./reports.component').then(m => m.ReportsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'daily-sales',
    loadComponent: () =>
      import('./daily-sales/daily-sales.component').then(m => m.DailySalesComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'gst-summary',
    loadComponent: () =>
      import('./gst-summary/gst-summary.component').then(m => m.GstSummaryComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'fast-moving',
    loadComponent: () =>
      import('./fast-moving/fast-moving.component').then(m => m.FastMovingComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'slow-moving',
    loadComponent: () =>
      import('./slow-moving/slow-moving.component').then(m => m.SlowMovingComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'item-wise-sales',
    loadComponent: () =>
      import('./item-wise-sales/item-wise-sales.component').then(m => m.ItemWiseSalesComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'low-stock',
    loadComponent: () =>
      import('./low-stock/low-stock.component').then(m => m.LowStockComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'expiry',
    loadComponent: () =>
      import('./expiry/expiry.component').then(m => m.ExpiryComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'reorder-suggestions',
    loadComponent: () =>
      import('./reorder-suggestions/reorder-suggestions.component').then(m => m.ReorderSuggestionsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'purchase-summary',
    loadComponent: () =>
      import('./purchase-summary/purchase-summary.component').then(m => m.PurchaseSummaryComponent),
    canActivate: [AuthGuard],
  },
];

