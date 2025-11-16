import { Routes } from '@angular/router';

export const posRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../pos/pos.component').then(m => m.PosComponent),
  },
  {
    path: 'kiosk',
    loadComponent: () =>
      import('./kiosk/kiosk.component').then(m => m.KioskComponent),
  },
  {
    path: 'assisted',
    loadComponent: () =>
      import('./assisted/assisted-pos.component').then(m => m.AssistedPosComponent),
  },
];

