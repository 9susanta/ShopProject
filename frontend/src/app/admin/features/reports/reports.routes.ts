import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/auth.guard';

export const reportsRoutes: Routes = [
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
];

