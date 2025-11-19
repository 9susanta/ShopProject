import { Routes } from '@angular/router';
import { AdminGuard } from '@core/auth/admin.guard';

export const masterRoutes: Routes = [
  {
    path: 'categories',
    loadComponent: () =>
      import('./categories/category-list/category-list.component').then(m => m.CategoryListComponent),
    canActivate: [AdminGuard],
  },
  {
    path: 'categories/new',
    loadComponent: () =>
      import('./categories/category-form/category-form.component').then(m => m.CategoryFormComponent),
    canActivate: [AdminGuard],
  },
  {
    path: 'categories/edit/:id',
    loadComponent: () =>
      import('./categories/category-form/category-form.component').then(m => m.CategoryFormComponent),
    canActivate: [AdminGuard],
  },
  {
    path: 'units',
    loadComponent: () =>
      import('./units/unit-list/unit-list.component').then(m => m.UnitListComponent),
    canActivate: [AdminGuard],
  },
  {
    path: 'tax-slabs',
    loadComponent: () =>
      import('./tax-slabs/taxslab-list/taxslab-list.component').then(m => m.TaxSlabListComponent),
    canActivate: [AdminGuard],
  },
  {
    path: 'tax-slabs/new',
    loadComponent: () =>
      import('./tax-slabs/taxslab-form/taxslab-form.component').then(m => m.TaxSlabFormComponent),
    canActivate: [AdminGuard],
  },
  {
    path: 'tax-slabs/edit/:id',
    loadComponent: () =>
      import('./tax-slabs/taxslab-form/taxslab-form.component').then(m => m.TaxSlabFormComponent),
    canActivate: [AdminGuard],
  },
  {
    path: '',
    redirectTo: 'categories',
    pathMatch: 'full',
  },
];



