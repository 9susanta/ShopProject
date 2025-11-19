import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { AdminGuard } from '@core/guards/auth.guard';

export const accountingRoutes: Routes = [
  {
    path: '',
    redirectTo: 'daily-closing',
    pathMatch: 'full',
  },
  {
    path: 'daily-closing',
    loadComponent: () =>
      import('./daily-closing/daily-closing.component').then(m => m.DailyClosingComponent),
    canActivate: [AuthGuard, AdminGuard],
  },
];

