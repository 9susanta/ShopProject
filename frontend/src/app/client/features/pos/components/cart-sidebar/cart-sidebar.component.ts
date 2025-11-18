import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartItem } from '../../../../../core/models/product.model';
import { QuantityPickerComponent } from '../../../../shared/components/quantity-picker/quantity-picker.component';

@Component({
  selector: 'grocery-cart-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    QuantityPickerComponent
  ],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.css']
})
export class CartSidebarComponent {
  // Inputs
  cart = input.required<CartItem[]>();
  customerPhone = input<string>('');
  lastSaleResponse = input<any>(null);
  cartTotal = input.required<number>();
  cartItemCount = input.required<number>();
  unlimitedQuantity = input<number>(999999);
  showCheckoutModal = input<boolean>(false);

  // Outputs
  removeItem = output<CartItem>();
  quantityChange = output<{item: CartItem, quantity: number}>();
  checkout = output<void>();
  phoneChange = output<string>();
  downloadInvoice = output<void>();

  // Computed
  isEmpty = computed(() => this.cart().length === 0);

  onPhoneChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.phoneChange.emit(value);
  }

  onQuantityChange(item: CartItem, quantity: number): void {
    this.quantityChange.emit({ item, quantity });
  }

  onRemoveItem(item: CartItem): void {
    this.removeItem.emit(item);
  }

  onCheckout(): void {
    this.checkout.emit();
  }

  onDownloadInvoice(): void {
    this.downloadInvoice.emit();
  }
}


