import { Routes } from '@angular/router';
import { AdminGuard } from '@core/auth/admin.guard';

export const toolsRoutes: Routes = [
  {
    path: 'barcode-printing',
    loadComponent: () =>
      import('./barcode-printing/barcode-printing.component').then(m => m.BarcodePrintingComponent),
    canActivate: [AdminGuard],
  },
  {
    path: 'weight-machine',
    loadComponent: () =>
      import('./weight-machine/weight-machine-test.component').then(m => m.WeightMachineTestComponent),
    canActivate: [AdminGuard],
  },
  {
    path: '',
    redirectTo: 'barcode-printing',
    pathMatch: 'full',
  },
];



