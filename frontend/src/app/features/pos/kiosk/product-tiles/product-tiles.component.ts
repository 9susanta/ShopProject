import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '@core/models/product.model';

@Component({
  selector: 'grocery-product-tiles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-tiles.component.html',
  styleUrls: ['./product-tiles.component.css'],
})
export class ProductTilesComponent {
  @Input() products: Product[] = [];
  @Output() addToCart = new EventEmitter<Product>();

  onAddToCart(product: Product): void {
    this.addToCart.emit(product);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

