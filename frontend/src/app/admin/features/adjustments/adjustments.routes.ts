import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/auth.guard';

export const adjustmentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./adjustment-history/adjustment-history.component').then(
        (m) => m.AdjustmentHistoryComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./adjustment-form/adjustment-form.component').then((m) => m.AdjustmentFormComponent),
    canActivate: [AuthGuard],
  },
];

