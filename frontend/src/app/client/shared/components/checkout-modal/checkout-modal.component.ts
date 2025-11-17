import { Component, Input, Output, EventEmitter, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem } from '@core/models/cart.model';
import { PaymentMethod, CreateSaleRequest } from '@core/models/sale.model';
import { SaleService } from '@core/services/sale.service';
import { ToastService } from '@core/toast/toast.service';
import { Product } from '@core/models/product.model';
import { firstValueFrom } from 'rxjs';

// Support both CartItem formats
type ProductCartItem = {
  product: Product;
  quantity: number;
  subtotal: number;
};

type CartItemInput = CartItem | ProductCartItem;

@Component({
  selector: 'grocery-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.css'],
})
export class CheckoutModalComponent {
  @Input() cart: CartItemInput[] = [];
  @Output() complete = new EventEmitter<any>(); // Emit sale response if available
  @Output() cancel = new EventEmitter<void>();

  private saleService = inject(SaleService);
  private toastService = inject(ToastService);

  customerPhone = signal('');
  paymentMethod = signal<PaymentMethod>(PaymentMethod.Cash);
  enablePayLater = signal(false);
  isProcessing = signal(false);

  readonly PaymentMethod = PaymentMethod;

  // Computed total that works with both cart item formats
  total = computed(() => {
    return this.cart.reduce((sum, item) => {
      return sum + (item.subtotal || 0);
    }, 0);
  });

  // Helper to check if item is product format (public for template)
  isProductCartItem(item: CartItemInput): item is ProductCartItem {
    return 'product' in item;
  }

  // Get product name from either format
  getProductName(item: CartItemInput): string {
    if (this.isProductCartItem(item)) {
      return item.product.name;
    }
    return item.productName;
  }

  // Get product ID for tracking
  getProductId(item: CartItemInput): string {
    if (this.isProductCartItem(item)) {
      return item.product.id;
    }
    return item.productId;
  }

  async onCheckout(): Promise<void> {
    if (this.cart.length === 0) {
      this.toastService.warning('Cart is empty');
      return;
    }

    this.isProcessing.set(true);

    try {
      // Convert cart items to sale request format
      const items = this.cart.map(item => {
        if (this.isProductCartItem(item)) {
          return {
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.salePrice,
          };
        } else {
          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          };
        }
      });

      // Calculate payment amounts based on selected method
      const total = this.total();
      let cashAmount = 0;
      let upiAmount = 0;
      let cardAmount = 0;
      let payLaterAmount = 0;

      if (this.paymentMethod() === PaymentMethod.Cash) {
        cashAmount = total;
      } else if (this.paymentMethod() === PaymentMethod.UPI) {
        upiAmount = total;
      } else if (this.paymentMethod() === PaymentMethod.Card) {
        cardAmount = total;
      } else if (this.paymentMethod() === PaymentMethod.PayLater || this.enablePayLater()) {
        payLaterAmount = total;
      }

      const saleRequest: CreateSaleRequest = {
        customerPhone: this.customerPhone() || undefined,
        items: items,
        paymentMethod: this.paymentMethod(),
        cashAmount: cashAmount,
        upiAmount: upiAmount,
        cardAmount: cardAmount,
        payLaterAmount: payLaterAmount,
        discountAmount: 0,
        notes: this.enablePayLater() ? 'Pay Later enabled' : undefined,
      };

      const response = await firstValueFrom(this.saleService.createSale(saleRequest));
      
      if (response) {
        this.toastService.success('Sale completed successfully');
        this.complete.emit(response);
      }
    } catch (error: any) {
      console.error('Checkout failed:', error);
      this.toastService.error(
        error?.error?.message || error?.message || 'Checkout failed. Please try again.'
      );
    } finally {
      this.isProcessing.set(false);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

