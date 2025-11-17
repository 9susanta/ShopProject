import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'grocery-sale-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sale-details-container">
      <h1>Sale Details</h1>
      <p>Sale details page - Coming soon</p>
    </div>
  `,
  styles: [`
    .sale-details-container {
      padding: 24px;
    }
  `]
})
export class SaleDetailsComponent {}

