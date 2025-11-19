import { Routes } from '@angular/router';
import { AdminGuard } from '@core/guards/auth.guard';

export const offerRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./offer-list/offer-list.component').then(m => m.OfferListComponent),
    canActivate: [AdminGuard],
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./offer-form/offer-form.component').then(m => m.OfferFormComponent),
    canActivate: [AdminGuard],
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./offer-form/offer-form.component').then(m => m.OfferFormComponent),
    canActivate: [AdminGuard],
  },
];

