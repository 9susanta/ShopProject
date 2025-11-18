import { Component, Input, Output, EventEmitter, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CartItem } from '@core/models/cart.model';
import { PaymentMethod, CreateSaleRequest } from '@core/models/sale.model';
import { SaleService } from '@core/services/sale.service';
import { CustomerService } from '@core/services/customer.service';
import { ToastService } from '@core/toast/toast.service';
import { AuthService } from '@core/services/auth.service';
import { Product } from '@core/models/product.model';
import { Customer } from '@core/models/customer.model';
import { firstValueFrom, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';

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
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
  ],
  templateUrl: './checkout-modal-enhanced.html',
  styleUrls: ['./checkout-modal.component.css'],
})
export class CheckoutModalComponent {
  @Input() cart: CartItemInput[] = [];
  @Output() complete = new EventEmitter<any>(); // Emit sale response if available
  @Output() cancel = new EventEmitter<void>();

  private saleService = inject(SaleService);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // Form for checkout
  checkoutForm!: FormGroup;

  // Customer identification
  customerPhone = signal('');
  customer = signal<Customer | null>(null);
  isGuest = signal(true);
  customerSearchLoading = signal(false);
  customerSearchResults = signal<Customer[]>([]);

  // Payment
  paymentMethod = signal<PaymentMethod>(PaymentMethod.Cash);
  enableSplitPayment = signal(false);
  splitCashAmount = signal(0);
  splitUPIAmount = signal(0);
  splitCardAmount = signal(0);
  splitPayLaterAmount = signal(0);

  // Discount & Offers
  discountType = signal<'percentage' | 'amount'>('percentage');
  discountValue = signal(0);
  couponCode = signal('');
  appliedOffers = signal<any[]>([]);

  // Loyalty
  loyaltyPointsAvailable = signal(0);
  loyaltyPointsToRedeem = signal(0);
  loyaltyPointsValue = computed(() => this.loyaltyPointsToRedeem() * 1); // 1 point = ₹1

  // Price Override
  canOverridePrice = computed(() => 
    this.authService.isAdmin() || this.authService.isSuperAdmin()
  );
  showPriceOverride = signal(false);

  // Processing
  isProcessing = signal(false);
  
  // Success state
  saleResponse = signal<any>(null);
  showSuccess = signal(false);

  readonly PaymentMethod = PaymentMethod;

  constructor() {
    this.initForm();
    
    // Watch customer phone changes for search
    effect(() => {
      const phone = this.customerPhone();
      if (phone && phone.length >= 10 && !this.isGuest()) {
        this.searchCustomer(phone);
      } else {
        this.customer.set(null);
        this.customerSearchResults.set([]);
      }
    });
  }

  initForm(): void {
    this.checkoutForm = this.fb.group({
      customerPhone: [''],
      isGuest: [true],
      paymentMethod: [PaymentMethod.Cash],
      enableSplit: [false],
      splitCash: [0],
      splitUPI: [0],
      splitCard: [0],
      splitPayLater: [0],
      discountType: ['percentage'],
      discountValue: [0],
      couponCode: [''],
      loyaltyPointsRedeem: [0],
      notes: [''],
    });
  }

  // Computed totals
  subtotal = computed(() => {
    return this.cart.reduce((sum, item) => {
      return sum + (item.subtotal || 0);
    }, 0);
  });

  discountAmount = computed(() => {
    if (this.discountType() === 'percentage') {
      return (this.subtotal() * this.discountValue()) / 100;
    }
    return Math.min(this.discountValue(), this.subtotal());
  });

  total = computed(() => {
    return Math.max(0, this.subtotal() - this.discountAmount() - this.loyaltyPointsValue());
  });

  remainingAmount = computed(() => {
    if (!this.enableSplitPayment()) {
      return this.total();
    }
    const paid = this.splitCashAmount() + this.splitUPIAmount() + 
                 this.splitCardAmount() + this.splitPayLaterAmount();
    return Math.max(0, this.total() - paid);
  });

  searchCustomer(phone: string): void {
    if (phone.length < 10) return;
    
    this.customerSearchLoading.set(true);
    this.customerService.getCustomerByPhone(phone).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.loyaltyPointsAvailable.set(customer.loyaltyPoints || 0);
        this.customerSearchLoading.set(false);
        this.toastService.success(`Customer found: ${customer.name}`);
      },
      error: (error) => {
        if (error.status === 404) {
          this.customer.set(null);
          this.toastService.info('Customer not found. Proceeding as Guest.');
        } else {
          this.toastService.error('Error searching customer');
        }
        this.customerSearchLoading.set(false);
      },
    });
  }

  setGuestMode(isGuest: boolean): void {
    this.isGuest.set(isGuest);
    if (isGuest) {
      this.customerPhone.set('');
      this.customer.set(null);
    }
  }

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

    // Validate split payment
    if (this.enableSplitPayment()) {
      const paid = this.splitCashAmount() + this.splitUPIAmount() + 
                   this.splitCardAmount() + this.splitPayLaterAmount();
      if (Math.abs(paid - this.total()) > 0.01) {
        this.toastService.error(`Payment mismatch. Total: ${this.total()}, Paid: ${paid}`);
        return;
      }
    }

    // Validate pay later
    if (this.splitPayLaterAmount() > 0 || this.paymentMethod() === PaymentMethod.PayLater) {
      const customer = this.customer();
      if (!customer || !customer.isPayLaterEnabled) {
        this.toastService.error('Pay Later is not enabled for this customer');
        return;
      }
      const payLaterAmount = this.enableSplitPayment() 
        ? this.splitPayLaterAmount() 
        : this.total();
      if (customer.payLaterBalance! + payLaterAmount > customer.payLaterLimit!) {
        this.toastService.error(`Pay Later limit exceeded. Limit: ${customer.payLaterLimit}, Current: ${customer.payLaterBalance}`);
        return;
      }
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

      // Calculate payment amounts
      const total = this.total();
      let cashAmount = 0;
      let upiAmount = 0;
      let cardAmount = 0;
      let payLaterAmount = 0;

      if (this.enableSplitPayment()) {
        cashAmount = this.splitCashAmount();
        upiAmount = this.splitUPIAmount();
        cardAmount = this.splitCardAmount();
        payLaterAmount = this.splitPayLaterAmount();
      } else {
        if (this.paymentMethod() === PaymentMethod.Cash) {
          cashAmount = total;
        } else if (this.paymentMethod() === PaymentMethod.UPI) {
          upiAmount = total;
        } else if (this.paymentMethod() === PaymentMethod.Card) {
          cardAmount = total;
        } else if (this.paymentMethod() === PaymentMethod.PayLater) {
          payLaterAmount = total;
        }
      }

      const saleRequest: CreateSaleRequest = {
        customerId: this.customer()?.id,
        customerPhone: this.isGuest() ? undefined : (this.customerPhone() || undefined),
        items: items,
        paymentMethod: this.enableSplitPayment() ? PaymentMethod.Split : this.paymentMethod(),
        cashAmount: cashAmount,
        upiAmount: upiAmount,
        cardAmount: cardAmount,
        payLaterAmount: payLaterAmount,
        discountAmount: this.discountAmount(),
        loyaltyPointsRedeemed: this.loyaltyPointsToRedeem(),
        couponCode: this.couponCode() || undefined,
        notes: this.checkoutForm.get('notes')?.value || undefined,
      };

      const response = await firstValueFrom(this.saleService.createSale(saleRequest));
      
      if (response) {
        // Show success state with points earned
        this.saleResponse.set(response);
        this.showSuccess.set(true);
        
        // Build success message with loyalty points if earned
        let successMessage = 'Sale completed successfully';
        if (response.loyaltyPointsEarned && response.loyaltyPointsEarned > 0) {
          successMessage += `! You earned ${response.loyaltyPointsEarned} loyalty points.`;
        }
        if (response.loyaltyPointsRedeemed && response.loyaltyPointsRedeemed > 0) {
          successMessage += ` (Redeemed ${response.loyaltyPointsRedeemed} points)`;
        }
        
        this.toastService.success(successMessage);
        
        // Auto-close after 3 seconds or emit immediately
        setTimeout(() => {
          this.complete.emit(response);
        }, 3000);
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
  
  closeSuccess(): void {
    const response = this.saleResponse();
    this.showSuccess.set(false);
    this.saleResponse.set(null);
    if (response) {
      this.complete.emit(response);
    }
  }
}

