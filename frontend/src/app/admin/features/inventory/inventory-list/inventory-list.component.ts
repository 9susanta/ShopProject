import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../services/inventory.service';
import { Inventory, InventoryFilters } from '@core/models/inventory.model';

@Component({
  selector: 'grocery-inventory-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inventory-container">
      <h1>Inventory Management</h1>
      <p>Inventory list component - to be implemented</p>
    </div>
  `,
})
export class InventoryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);

  inventories = signal<Inventory[]>([]);

  ngOnInit(): void {
    // TODO: Implement inventory list
  }
}

