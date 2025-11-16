import { Routes } from '@angular/router';
import { AdminGuard } from '@core/auth/admin.guard';

export const importRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./import-page/import-page.component').then(m => m.ImportPageComponent),
    canActivate: [AdminGuard],
  },
  {
    path: 'jobs',
    loadComponent: () =>
      import('./import-jobs-list/import-jobs-list.component').then(m => m.ImportJobsListComponent),
    canActivate: [AdminGuard],
  },
  {
    path: 'jobs/:id',
    loadComponent: () =>
      import('./import-job-details/import-job-details.component').then(m => m.ImportJobDetailsComponent),
    canActivate: [AdminGuard],
  },
];

