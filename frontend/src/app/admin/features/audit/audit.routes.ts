import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/auth.guard';
import { AdminGuard } from '@core/auth/admin.guard';

export const auditRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./audit-logs/audit-logs.component').then((m) => m.AuditLogsComponent),
    canActivate: [AuthGuard, AdminGuard],
  },
];

