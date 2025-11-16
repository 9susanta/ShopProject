import { Routes } from '@angular/router';
import { AdminGuard } from '../core/guards/auth.guard';
import { dashboardResolver } from './dashboard/dashboard.resolver';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [AdminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => 
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
        resolve: { data: dashboardResolver },
      },
      {
        path: 'imports',
        loadComponent: () => 
          import('./imports/import-upload.component').then(m => m.ImportUploadComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

