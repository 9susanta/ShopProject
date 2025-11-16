import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'grocery-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="reports-container">
      <h1>Reports</h1>
      <div class="reports-grid">
        <a routerLink="/reports/daily-sales" class="report-card">
          <span class="material-icons">bar_chart</span>
          <h3>Daily Sales</h3>
        </a>
        <a routerLink="/reports/gst-summary" class="report-card">
          <span class="material-icons">receipt</span>
          <h3>GST Summary</h3>
        </a>
        <a routerLink="/reports/fast-moving" class="report-card">
          <span class="material-icons">trending_up</span>
          <h3>Fast Moving Products</h3>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-top: 32px;
    }

    .report-card {
      background: white;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .report-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .report-card .material-icons {
      font-size: 48px;
      color: var(--primary);
      margin-bottom: 16px;
    }

    .report-card h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
    }
  `]
})
export class ReportsComponent {}

