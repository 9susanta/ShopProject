import { Routes } from '@angular/router';

export const posRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pos/pos.component').then(m => m.PosComponent),
  },
];

