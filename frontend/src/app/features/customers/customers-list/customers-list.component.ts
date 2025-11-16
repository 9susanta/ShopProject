import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'grocery-customers-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="customers-list-container">
      <h1>Customers List</h1>
      <p>Customers management page - Coming soon</p>
    </div>
  `,
  styles: [`
    .customers-list-container {
      padding: 24px;
    }
  `]
})
export class CustomersListComponent {}

