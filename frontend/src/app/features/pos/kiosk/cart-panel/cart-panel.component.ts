import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '@core/models/cart.model';

@Component({
  selector: 'grocery-cart-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-panel.component.html',
  styleUrls: ['./cart-panel.component.css'],
})
export class CartPanelComponent {
  @Input() cart: CartItem[] = [];
  @Output() cartUpdated = new EventEmitter<CartItem[]>();
  @Output() checkout = new EventEmitter<void>();

  total = computed(() => {
    return this.cart.reduce((sum, item) => sum + item.subtotal, 0);
  });

  updateQuantity(item: CartItem, delta: number): void {
    const updatedCart = this.cart.map(cartItem => {
      if (cartItem.productId === item.productId) {
        const newQuantity = Math.max(0, cartItem.quantity + delta);
        if (newQuantity === 0) {
          return null;
        }
        return {
          ...cartItem,
          quantity: newQuantity,
          subtotal: newQuantity * cartItem.unitPrice,
        };
      }
      return cartItem;
    }).filter(item => item !== null) as CartItem[];

    this.cartUpdated.emit(updatedCart);
  }

  removeItem(productId: string): void {
    const updatedCart = this.cart.filter(item => item.productId !== productId);
    this.cartUpdated.emit(updatedCart);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

