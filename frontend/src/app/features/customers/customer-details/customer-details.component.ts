import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'grocery-customer-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="customer-details-container">
      <h1>Customer Details</h1>
      <p>Customer details page - Coming soon</p>
    </div>
  `,
  styles: [`
    .customer-details-container {
      padding: 24px;
    }
  `]
})
export class CustomerDetailsComponent {}

