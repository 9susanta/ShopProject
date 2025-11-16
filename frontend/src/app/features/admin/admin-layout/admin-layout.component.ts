import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AdminHeaderComponent } from '../../../admin/admin-header/admin-header.component';

@Component({
  selector: 'grocery-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, AdminHeaderComponent],
  template: `
    <div class="admin-layout">
      <grocery-admin-header></grocery-admin-header>
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {}

