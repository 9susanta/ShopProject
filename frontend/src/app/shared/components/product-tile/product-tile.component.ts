import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '@core/models/product.model';
import { QuantityPickerComponent } from '../quantity-picker/quantity-picker.component';

@Component({
  selector: 'grocery-product-tile',
  standalone: true,
  imports: [CommonModule, QuantityPickerComponent],
  templateUrl: './product-tile.component.html',
  styleUrls: ['./product-tile.component.css'],
})
export class ProductTileComponent {
  // Signal-based inputs (Angular 20 feature)
  product = input.required<Product>();
  showQuantityPicker = input<boolean>(false);
  quantity = input<number>(0);

  // Signal-based outputs (Angular 20 feature)
  addToCart = output<{ product: Product; quantity: number }>();
  quantityChange = output<number>();

  // Computed signals for derived state
  imageUrl = computed(() => 
    this.product().imageUrl || '/assets/images/placeholder-product.png'
  );

  isLowStock = computed(() => {
    const product = this.product();
    return (
      product.lowStockThreshold !== undefined &&
      product.stock <= product.lowStockThreshold
    );
  });

  onAddToCart(): void {
    this.addToCart.emit({ 
      product: this.product(), 
      quantity: this.quantity() || 1 
    });
  }

  onQuantityChange(quantity: number): void {
    this.quantityChange.emit(quantity);
  }
}
