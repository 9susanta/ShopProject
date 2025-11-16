import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'grocery-sales-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sales-list-container">
      <h1>Sales List</h1>
      <p>Sales management page - Coming soon</p>
    </div>
  `,
  styles: [`
    .sales-list-container {
      padding: 24px;
    }
  `]
})
export class SalesListComponent {}

