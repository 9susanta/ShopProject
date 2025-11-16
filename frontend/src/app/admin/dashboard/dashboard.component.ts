import { Component, OnInit, signal, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from './dashboard.service';
import { DashboardData } from '../../core/models/dashboard.model';

@Component({
  selector: 'grocery-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  // Using inject() (Angular 20 feature)
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signal-based state
  isLoading = signal<boolean>(true);
  dashboardData = signal<DashboardData | null>(null);

  constructor() {
    // Data should be preloaded by resolver
  }

  ngOnInit(): void {
    // Get data from route resolver (Angular 20 style)
    this.route.data.subscribe((data) => {
      const resolvedData = data['data'] as DashboardData;
      if (resolvedData) {
        this.dashboardData.set(resolvedData);
        this.isLoading.set(false);
      }
    });
  }

  navigateToImports(): void {
    this.router.navigate(['/admin/imports']);
  }

  navigateToImportDetails(importId: string): void {
    this.router.navigate(['/admin/imports', importId]);
  }
}
