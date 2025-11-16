import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from './dashboard.service';
import { DashboardData } from '@core/models/dashboard.model';
import { Subscription, interval } from 'rxjs';
import { environment } from '@environments/environment';

@Component({
  selector: 'grocery-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private subscriptions = new Subscription();

  isLoading = signal<boolean>(true);
  dashboardData = signal<DashboardData | null>(null);
  private isLoadingData = false;

  // Computed values for display
  todaySalesFormatted = computed(() => {
    const sales = this.dashboardData()?.kpis?.todaySales ?? 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(sales);
  });

  monthSalesFormatted = computed(() => {
    const sales = this.dashboardData()?.kpis?.monthSales ?? 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(sales);
  });

  ngOnInit(): void {
    this.loadDashboardData();

    // Auto-refresh every 30 seconds
    if (environment.autoRefreshInterval > 0) {
      const refreshSubscription = interval(environment.autoRefreshInterval).subscribe(() => {
        this.loadDashboardData();
      });
      this.subscriptions.add(refreshSubscription);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData(): void {
    if (this.isLoadingData) {
      return;
    }
    this.isLoadingData = true;
    this.isLoading.set(true);

    const subscription = this.dashboardService.getDashboardData().subscribe({
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
        this.dashboardData.set({
          kpis: {
            todaySales: 0,
            monthSales: 0,
            lowStockCount: 0,
            totalProducts: 0,
            totalCategories: 0,
          },
          recentImports: [],
          lowStockProducts: [],
        });
      },
    });

    this.subscriptions.add(subscription);
  }

  refresh(): void {
    this.loadDashboardData();
  }

  navigateToImports(): void {
    // Navigation handled by router link in template
  }

  navigateToImportDetails(importId: string): void {
    // Navigation handled by router link in template
  }
}

