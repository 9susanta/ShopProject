import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductTilesComponent } from './product-tiles/product-tiles.component';
import { CategoryNavComponent } from './category-nav/category-nav.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { VoiceCommandButtonComponent } from './voice-command-button/voice-command-button.component';
import { CartPanelComponent } from './cart-panel/cart-panel.component';
import { CheckoutModalComponent } from './checkout-modal/checkout-modal.component';
import { ProductService } from '../../admin/products/product.service';
import { Product } from '@core/models/product.model';
import { CartItem } from '@core/models/cart.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'grocery-kiosk',
  standalone: true,
  imports: [
    CommonModule,
    ProductTilesComponent,
    CategoryNavComponent,
    SearchBarComponent,
    VoiceCommandButtonComponent,
    CartPanelComponent,
    CheckoutModalComponent,
  ],
  templateUrl: './kiosk.component.html',
  styleUrls: ['./kiosk.component.css'],
})
export class KioskComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private subscriptions = new Subscription();

  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  selectedCategory = signal<string | null>(null);
  searchTerm = signal('');
  cart = signal<CartItem[]>([]);
  showCheckout = signal(false);

  cartTotal = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.subtotal, 0);
  });

  cartItemCount = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.quantity, 0);
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProducts(): void {
    const sub = this.productService.getProducts({ isActive: true, pageSize: 1000 }).subscribe({
      next: (response) => {
        this.products.set(response.items);
        this.filteredProducts.set(response.items);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      },
    });
    this.subscriptions.add(sub);
  }

  onCategorySelected(categoryId: string | null): void {
    this.selectedCategory.set(categoryId);
    this.applyFilters();
  }

  onSearch(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.products()];

    if (this.selectedCategory()) {
      filtered = filtered.filter(p => p.categoryId === this.selectedCategory());
    }

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (p.barcode && p.barcode.toLowerCase().includes(term))
      );
    }

    this.filteredProducts.set(filtered);
  }

  onAddToCart(product: Product): void {
    const currentCart = this.cart();
    const existingItem = currentCart.find(item => item.productId === product.id);

    if (existingItem) {
      const updatedCart = currentCart.map(item =>
        item.productId === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              subtotal: (item.quantity + 1) * item.unitPrice,
            }
          : item
      );
      this.cart.set(updatedCart);
    } else {
      this.cart.set([
        ...currentCart,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: product.salePrice,
          quantity: 1,
          subtotal: product.salePrice,
        },
      ]);
    }
  }

  onCartUpdated(cart: CartItem[]): void {
    this.cart.set(cart);
  }

  onCheckout(): void {
    if (this.cart().length === 0) {
      return;
    }
    this.showCheckout.set(true);
  }

  onCheckoutComplete(): void {
    this.cart.set([]);
    this.showCheckout.set(false);
  }

  onCheckoutCancel(): void {
    this.showCheckout.set(false);
  }
}

