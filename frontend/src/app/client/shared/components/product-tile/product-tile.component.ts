import { Component, input, output, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '@core/models/product.model';
import { QuantityPickerComponent } from '../quantity-picker/quantity-picker.component';

@Component({
  selector: 'grocery-product-tile',
  standalone: true,
  imports: [CommonModule, MatIconModule, QuantityPickerComponent],
  templateUrl: './product-tile.component.html',
  styleUrls: ['./product-tile.component.css'],
})
export class ProductTileComponent {
  // Constant for unlimited quantity (when stock data not available)
  readonly UNLIMITED_QUANTITY = 999999;

  // Signal-based inputs (Angular 20 feature)
  product = input.required<Product>();
  showQuantityPicker = input<boolean>(false);
  quantity = input<number>(0);

  // Internal quantity state to track quantity picker changes
  private currentQuantity = signal<number>(1);

  // Signal-based outputs (Angular 20 feature)
  addToCart = output<{ product: Product; quantity: number }>();
  quantityChange = output<number>();

  constructor() {
    // Initialize currentQuantity when quantity input changes
    effect(() => {
      const qty = this.quantity();
      if (qty > 0) {
        this.currentQuantity.set(qty);
      }
    });
  }

  // Computed signals for derived state
  imageUrl = computed(() => {
    const productImage = this.product().imageUrl;
    if (productImage) {
      return productImage;
    }
    // Use a data URI for placeholder to avoid 404 errors
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  });

  isLowStock = computed(() => {
    const product = this.product();
    return (
      product.lowStockThreshold !== undefined &&
      product.lowStockThreshold > 0
    );
  });

  // Get the current quantity value (from picker if shown, otherwise from input or default to 1)
  getQuantity(): number {
    if (this.showQuantityPicker()) {
      return this.currentQuantity();
    }
    return this.quantity() || 1;
  }

  onAddToCart(): void {
    const qty = this.getQuantity();
    this.addToCart.emit({ 
      product: this.product(), 
      quantity: qty
    });
  }

  onQuantityChange(quantity: number): void {
    this.currentQuantity.set(quantity);
    this.quantityChange.emit(quantity);
  }
}
