import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { DashboardData } from '../../core/models/dashboard.model';

/**
 * Functional resolver for dashboard data (Angular 20 style)
 * Preloads dashboard data before route activation
 */
export const dashboardResolver: ResolveFn<DashboardData> = (route, state) => {
  const dashboardService = inject(DashboardService);
  return dashboardService.getDashboardData();
};
