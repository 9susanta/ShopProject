import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../../../core/models/product.model';

@Component({
  selector: 'grocery-product-tile-kiosk',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './product-tile-kiosk.component.html',
  styleUrls: ['./product-tile-kiosk.component.css']
})
export class ProductTileKioskComponent {
  // Inputs
  product = input.required<Product>();
  cartQuantity = input<number>(0);
  isOutOfStock = input<boolean>(false);
  isLowStock = input<boolean>(false);

  // Outputs
  addToCart = output<Product>();
  increment = output<Product>();
  decrement = output<Product>();
  tileClick = output<{product: Product, event: Event}>();

  // Computed properties
  canIncrement = computed(() => {
    const product = this.product();
    const cartQty = this.cartQuantity();
    const isOutOfStock = this.isOutOfStock();
    
    if (isOutOfStock) return false;
    if (product.availableQuantity === undefined || product.availableQuantity === null) {
      return true; // Unlimited stock
    }
    return cartQty < product.availableQuantity;
  });

  discountPercentage = computed(() => {
    const product = this.product();
    if (!product.mrp || product.mrp <= product.salePrice || this.isOutOfStock()) {
      return 0;
    }
    return ((product.mrp - product.salePrice) / product.mrp * 100).toFixed(0);
  });

  onAddToCartClick(event: Event): void {
    event.stopPropagation();
    this.addToCart.emit(this.product());
  }

  onIncrementClick(event: Event): void {
    event.stopPropagation();
    this.increment.emit(this.product());
  }

  onDecrementClick(event: Event): void {
    event.stopPropagation();
    this.decrement.emit(this.product());
  }

  onTileClick(event: Event): void {
    const target = event.target as HTMLElement;
    // Don't trigger if clicking on buttons or controls
    if (target.closest('button') || target.closest('.tile-controls')) {
      return;
    }
    
    if (!this.isOutOfStock()) {
      this.tileClick.emit({ product: this.product(), event });
    }
  }
}










