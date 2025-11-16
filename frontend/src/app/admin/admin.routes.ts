import { Routes } from '@angular/router';
import { AdminGuard } from '../core/guards/auth.guard';
import { dashboardResolver } from './dashboard/dashboard.resolver';

export const adminRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => 
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    resolve: { data: dashboardResolver },
    canActivate: [AdminGuard],
  },
  {
    path: 'imports',
    loadComponent: () => 
      import('./imports/import-upload.component').then(m => m.ImportUploadComponent),
    canActivate: [AdminGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];

