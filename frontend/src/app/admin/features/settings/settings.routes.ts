import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/auth.guard';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./store-settings/store-settings.component').then(m => m.StoreSettingsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'roles',
    loadComponent: () =>
      import('./roles-permissions/roles-permissions.component').then(m => m.RolesPermissionsComponent),
    canActivate: [AuthGuard],
  },
];

