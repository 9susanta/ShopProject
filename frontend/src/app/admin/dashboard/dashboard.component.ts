import { Component, OnInit, OnDestroy, signal, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from './dashboard.service';
import { DashboardData } from '../../core/models/dashboard.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'grocery-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Using inject() (Angular 20 feature)
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signal-based state
  isLoading = signal<boolean>(true);
  dashboardData = signal<DashboardData | null>(null);
  private isLoadingData = false; // Prevent concurrent loads

  // Subscriptions for cleanup
  private routeDataSubscription?: Subscription;
  private dashboardDataSubscription?: Subscription;

  constructor() {
    // Data should be preloaded by resolver
  }

  private dashboardService = inject(DashboardService);

  ngOnInit(): void {
    // Get data from route resolver (Angular 20 style)
    this.routeDataSubscription = this.route.data.subscribe({
      next: (data) => {
        const resolvedData = data['data'] as DashboardData;
        if (resolvedData && resolvedData.kpis) {
          this.dashboardData.set(resolvedData);
          this.isLoading.set(false);
        } else {
          // If resolver didn't provide data, fetch it directly
          console.warn('Resolver did not provide data, fetching directly');
          this.loadDashboardData();
        }
      },
      error: (error) => {
        console.error('Error loading dashboard data from resolver:', error);
        // If resolver fails, try to load directly
        this.loadDashboardData();
      }
    });
  }

  private loadDashboardData(): void {
    // Prevent concurrent calls
    if (this.isLoadingData) {
      return;
    }
    this.isLoadingData = true;

    this.dashboardDataSubscription = this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.isLoadingData = false;
        if (data && data.kpis) {
          this.dashboardData.set(data);
          this.isLoading.set(false);
        } else {
          console.error('Invalid dashboard data received:', data);
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        this.isLoadingData = false;
        console.error('Error loading dashboard data:', error);
        this.isLoading.set(false);
        // Set empty data structure to prevent template errors
        this.dashboardData.set({
          kpis: {
            todaySales: 0,
            monthSales: 0,
            lowStockCount: 0,
            totalProducts: 0,
            totalCategories: 0
          },
          recentImports: [],
          lowStockProducts: []
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe();
    }
    if (this.dashboardDataSubscription) {
      this.dashboardDataSubscription.unsubscribe();
    }
  }

  navigateToImports(): void {
    this.router.navigate(['/admin/imports']);
  }

  navigateToImportDetails(importId: string): void {
    this.router.navigate(['/admin/imports', importId]);
  }
}
