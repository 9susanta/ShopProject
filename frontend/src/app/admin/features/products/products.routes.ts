import { Routes } from '@angular/router';
import { AdminGuard } from '@core/guards/auth.guard';

export const productRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./product-list/product-list.component').then(m => m.ProductListComponent),
    canActivate: [AdminGuard],
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./product-create/product-create.component').then(m => m.ProductCreateComponent),
    canActivate: [AdminGuard],
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./product-form/product-form.component').then(m => m.ProductFormComponent),
    canActivate: [AdminGuard],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./product-details/product-details.component').then(m => m.ProductDetailsComponent),
    canActivate: [AdminGuard],
  },
];

