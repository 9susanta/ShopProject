import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';

@Component({
  selector: 'grocery-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminHeaderComponent],
  template: `
    <div class="admin-layout">
      <!-- Admin Header -->
      <grocery-admin-header></grocery-admin-header>
      <!-- Main Content Area -->
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--gray-50);
    }

    .admin-content {
      flex: 1;
      padding: 0;
      overflow-y: auto;
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  ngOnInit(): void {
    console.log('AdminLayoutComponent initialized');
  }
}

