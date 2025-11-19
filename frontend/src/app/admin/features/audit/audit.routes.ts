import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { AdminGuard } from '@core/guards/auth.guard';

export const auditRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./audit-logs/audit-logs.component').then((m) => m.AuditLogsComponent),
    canActivate: [AuthGuard, AdminGuard],
  },
];

