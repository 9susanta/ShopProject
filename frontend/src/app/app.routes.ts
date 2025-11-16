import { Routes } from '@angular/router';
import { AuthGuard, AdminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'pos',
    loadComponent: () => import('./pos/pos.component').then(m => m.PosComponent),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: '',
    redirectTo: '/pos',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/pos',
  },
];

