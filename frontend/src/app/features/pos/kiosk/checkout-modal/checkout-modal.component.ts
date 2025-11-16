import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem } from '@core/models/cart.model';
import { PaymentMethod } from '@core/models/sale.model';
import { SaleService } from '@core/services/sale.service';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'grocery-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.css'],
})
export class CheckoutModalComponent {
  @Input() cart: CartItem[] = [];
  @Output() complete = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  private saleService = inject(SaleService);
  private toastService = inject(ToastService);

  customerPhone = signal('');
  paymentMethod = signal<PaymentMethod>(PaymentMethod.Cash);
  enablePayLater = signal(false);
  isProcessing = signal(false);

  readonly PaymentMethod = PaymentMethod;

  total = this.cart.reduce((sum, item) => sum + item.subtotal, 0);

  onCheckout(): void {
    if (this.cart.length === 0) {
      this.toastService.warning('Cart is empty');
      return;
    }

    this.isProcessing.set(true);

    const saleRequest = {
      customerPhone: this.customerPhone() || undefined,
      items: this.cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      paymentMethod: this.paymentMethod(),
      enablePayLater: this.enablePayLater(),
    };

    // TODO: Implement sale service
    setTimeout(() => {
      this.isProcessing.set(false);
      this.toastService.success('Sale completed successfully');
      this.complete.emit();
    }, 1000);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

