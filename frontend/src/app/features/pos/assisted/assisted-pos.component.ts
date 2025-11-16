import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'grocery-assisted-pos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="assisted-pos-container">
      <h1>Assisted POS</h1>
      <p>Assisted POS component for sales staff - to be implemented</p>
    </div>
  `,
})
export class AssistedPosComponent {}

