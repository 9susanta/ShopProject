import { Component, OnInit, OnDestroy, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, Subscription, debounceTime, distinctUntilChanged, firstValueFrom, switchMap, catchError, of } from 'rxjs';
import { PosService } from '../services/pos.service';
import { VoiceToTextService, VoiceCommand } from '../../../../core/services/voice-to-text.service';
import { CacheService } from '../../../../core/services/cache.service';
import { Product, Category, CartItem, SaleRequest } from '../../../../core/models/product.model';
import { SaleResponse } from '../../../../core/models/product.model';
import { BarcodeInputComponent } from '../../../shared/components/barcode-input/barcode-input.component';
import { QuantityPickerComponent } from '../../../shared/components/quantity-picker/quantity-picker.component';
import { CategoryMultiselectComponent } from '../../../shared/components/category-multiselect/category-multiselect.component';
import { CheckoutModalComponent } from '../../../shared/components/checkout-modal/checkout-modal.component';

@Component({
  selector: 'grocery-pos',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule,
    MatTooltipModule,
    BarcodeInputComponent,
    QuantityPickerComponent,
    CategoryMultiselectComponent,
    CheckoutModalComponent
  ],
  templateUrl: './pos.component.html',
  styleUrls: [
    './pos.component.css',
    './pos-products.component.css',
    './pos-cart.component.css'
  ],
})
export class PosComponent implements OnInit, OnDestroy {
  // Constant for unlimited quantity (when stock data not available)
  readonly UNLIMITED_QUANTITY = 999999;

  // Using inject() instead of constructor (Angular 20 feature)
  private posService = inject(PosService);
  private voiceService = inject(VoiceToTextService);
  private cache = inject(CacheService);

  // Signal-based state management
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  selectedCategoryIds = signal<string[]>([]);
  searchTerm = signal<string>('');
  cart = signal<CartItem[]>([]);
  customerPhone = signal<string>('');
  isVoiceListening = signal<boolean>(false);
  isProcessingSale = signal<boolean>(false);
  lastSaleResponse = signal<any>(null);
  showCheckoutModal = signal<boolean>(false);

  // Convert RxJS observables to signals (Angular 20 feature)
  private searchSubject = new Subject<string>();
  private subscriptions = new Subscription();

  // Computed signals for derived state
  filteredProducts = computed(() => {
    let filtered = [...this.products()];
    const selectedCategoryIds = this.selectedCategoryIds();
    const term = this.searchTerm().toLowerCase().trim();

    // Filter by selected categories (multi-select)
    if (selectedCategoryIds.length > 0) {
      filtered = filtered.filter((p) => p.categoryId && selectedCategoryIds.includes(p.categoryId));
    }

    // Filter by search term
    if (term) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.sku?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.barcode?.toLowerCase().includes(term)
      );
    }

    // Show all registered products (both active and inactive)
    // You can optionally filter to show only active products by uncommenting the line below:
    // filtered = filtered.filter((p) => p.isActive !== false);

    return filtered;
  });

  cartTotal = computed(() => 
    this.cart().reduce((sum, item) => sum + item.subtotal, 0)
  );

  cartItemCount = computed(() => 
    this.cart().reduce((sum, item) => sum + item.quantity, 0)
  );

  // Track selected quantities before adding to cart
  selectedQuantities = signal<Map<string, number>>(new Map());

  // Computed signal for cart quantities by product ID
  cartQuantities = computed(() => {
    const quantities = new Map<string, number>();
    this.cart().forEach(item => {
      quantities.set(item.product.id, item.quantity);
    });
    return quantities;
  });

  // Effect to handle search debouncing (Angular 20 feature)
  constructor() {
    effect(() => {
      const term = this.searchTerm();
      if (term.trim()) {
        this.searchSubject.next(term);
      } else {
        // Reset to all products when search is cleared
      }
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.setupSearch();
    this.setupVoiceCommands();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadProducts(): void {
    this.subscriptions.add(
      this.posService.getProducts().subscribe({
        next: (products) => {
          this.products.set(products);
        },
        error: (error) => {
          console.error('Failed to load products:', error);
        },
      })
    );
  }

  private loadCategories(): void {
    this.subscriptions.add(
      this.posService.getCategories().subscribe({
        next: (categories) => {
          this.categories.set(categories);
        },
        error: (error) => {
          console.error('Failed to load categories:', error);
        },
      })
    );
  }

  private setupSearch(): void {
    // Enhanced search: Use client-side filtering for better performance
    // The filteredProducts computed signal handles the filtering
    // This method is kept for potential future API-based search if needed
    this.subscriptions.add(
      this.searchSubject
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe((term) => {
          // Client-side filtering is handled by filteredProducts computed signal
          // No need to make API calls for every search term change
          // This provides instant feedback and better UX
        })
    );
  }

  private setupVoiceCommands(): void {
    this.subscriptions.add(
      this.voiceService.command$.subscribe((command) => {
        this.handleVoiceCommand(command);
      })
    );
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  onCategorySelectionChange(categoryIds: string[]): void {
    this.selectedCategoryIds.set(categoryIds);
  }

  onAddToCart(event: { product: Product; quantity: number }): void {
    this.cart.update(currentCart => {
      const existingItemIndex = currentCart.findIndex(
        (item) => item.product.id === event.product.id
      );

      if (existingItemIndex > -1) {
        // Create a new array with the updated item (immutable update)
        const existingItem = currentCart[existingItemIndex];
        const updatedItem = {
          ...existingItem,
          quantity: existingItem.quantity + event.quantity,
          subtotal: existingItem.product.salePrice * (existingItem.quantity + event.quantity),
        };
        return [
          ...currentCart.slice(0, existingItemIndex),
          updatedItem,
          ...currentCart.slice(existingItemIndex + 1),
        ];
      } else {
        return [
          ...currentCart,
          {
            product: event.product,
            quantity: event.quantity,
            subtotal: event.product.salePrice * event.quantity,
          },
        ];
      }
    });
  }

  onQuantityChange(item: CartItem, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(item);
    } else {
      this.cart.update(currentCart => {
        const index = currentCart.indexOf(item);
        if (index > -1) {
          // Create a new array with the updated item (immutable update)
          const updatedItem = {
            ...currentCart[index],
            quantity: quantity,
            subtotal: item.product.salePrice * quantity,
          };
          return [
            ...currentCart.slice(0, index),
            updatedItem,
            ...currentCart.slice(index + 1),
          ];
        }
        return currentCart; // No change if item not found
      });
    }
  }

  removeFromCart(item: CartItem): void {
    this.cart.update(currentCart => 
      currentCart.filter(cartItem => cartItem !== item)
    );
  }

  toggleVoiceListening(): void {
    if (this.isVoiceListening()) {
      this.voiceService.stopListening();
    } else {
      this.voiceService.startListening();
    }
    this.isVoiceListening.set(this.voiceService.getIsListening());
  }

  private handleVoiceCommand(command: VoiceCommand): void {
    switch (command.action) {
      case 'add':
        if (command.productName && command.quantity) {
          const product = this.products().find(
            (p) => p.name.toLowerCase() === command.productName?.toLowerCase()
          );
          if (product) {
            this.onAddToCart({ product, quantity: command.quantity });
          }
        }
        break;
      case 'remove':
        if (command.productName) {
          const item = this.cart().find(
            (item) => item.product.name.toLowerCase() === command.productName?.toLowerCase()
          );
          if (item) {
            this.removeFromCart(item);
          }
        }
        break;
      case 'search':
        if (command.searchTerm) {
          this.searchTerm.set(command.searchTerm);
        }
        break;
      case 'checkout':
        this.onCheckout();
        break;
      case 'clear':
        this.cart.set([]);
        break;
    }
  }

  onBarcodeScanned(barcode: string): void {
    if (!barcode || barcode.trim().length === 0) {
      return;
    }

    this.subscriptions.add(
      this.posService.getProductByBarcode(barcode.trim()).subscribe({
        next: (product) => {
          this.onAddToCart({ product, quantity: 1 });
        },
        error: (error) => {
          console.error('Barcode scan failed:', error);
          // Show error to user (you can add toast notification here)
          alert('Product not found for barcode: ' + barcode);
        },
      })
    );
  }

  onCheckout(): void {
    const currentCart = this.cart();
    if (currentCart.length === 0) {
      return;
    }
    // Show checkout modal instead of processing directly
    this.showCheckoutModal.set(true);
  }

  onCheckoutComplete(saleResponse?: any): void {
    if (saleResponse) {
      this.lastSaleResponse.set(saleResponse);
    }
    this.cart.set([]);
    this.customerPhone.set('');
    this.showCheckoutModal.set(false);
    this.cache.invalidatePattern('products');
  }

  onCheckoutCancel(): void {
    this.showCheckoutModal.set(false);
  }

  downloadInvoice(): void {
    const response = this.lastSaleResponse();
    if (response?.pdfUrl) {
      window.open(response.pdfUrl, '_blank');
    }
  }

  // Get cart quantity for a specific product
  getCartQuantity(productId: string): number {
    return this.cartQuantities().get(productId) || 0;
  }

  // Get selected quantity for a specific product (before adding to cart)
  getSelectedQuantity(productId: string): number {
    return this.selectedQuantities().get(productId) || 0;
  }

  // Set selected quantity
  setSelectedQuantity(productId: string, quantity: number): void {
    const current = new Map(this.selectedQuantities());
    if (quantity <= 0) {
      current.delete(productId);
    } else {
      current.set(productId, quantity);
    }
    this.selectedQuantities.set(current);
  }

  // Get max quantity available for a product
  getMaxQuantity(productId: string): number {
    const product = this.products().find(p => p.id === productId);
    if (!product) return this.UNLIMITED_QUANTITY;
    if (product.availableQuantity === undefined || product.availableQuantity === null) {
      return this.UNLIMITED_QUANTITY;
    }
    return product.availableQuantity;
  }

  // Increment selected quantity (before adding to cart)
  incrementSelectedQuantity(product: Product): void {
    const currentQty = this.getSelectedQuantity(product.id);
    const maxQty = this.getMaxQuantity(product.id);
    const newQty = Math.min(currentQty + 1, maxQty);
    this.setSelectedQuantity(product.id, newQty);
  }

  // Decrement selected quantity (before adding to cart)
  decrementSelectedQuantity(product: Product): void {
    const currentQty = this.getSelectedQuantity(product.id);
    if (currentQty > 0) {
      this.setSelectedQuantity(product.id, currentQty - 1);
    }
  }

  // Add selected quantity to cart
  addSelectedToCart(product: Product): void {
    const quantity = this.getSelectedQuantity(product.id);
    if (quantity > 0) {
      this.onAddToCart({ product, quantity });
      this.setSelectedQuantity(product.id, 0); // Reset after adding
    }
  }

  // Increment product quantity in cart
  incrementProductQuantity(product: Product): void {
    const currentQty = this.getCartQuantity(product.id);
    const maxQty = this.getMaxQuantity(product.id);
    const newQty = Math.min(currentQty + 1, maxQty);
    
    if (newQty > currentQty) {
      this.onAddToCart({ product, quantity: 1 });
    }
  }

  // Decrement product quantity in cart
  decrementProductQuantity(product: Product): void {
    const currentItem = this.cart().find(item => item.product.id === product.id);
    if (currentItem) {
      const newQty = currentItem.quantity - 1;
      this.onQuantityChange(currentItem, newQty);
    }
  }

  // Handle tile click - add 1 quantity to cart
  onTileClick(product: Product, event: Event): void {
    // Don't add if clicking on buttons or controls
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('.tile-controls')) {
      return;
    }
    
    // Don't add if out of stock
    if (this.isOutOfStock(product)) {
      return;
    }

    // Add 1 quantity to cart
    this.onAddToCart({ product, quantity: 1 });
  }

  // Handle Add to Cart button click
  onAddToCartClick(product: Product, event: Event): void {
    event.stopPropagation();
    if (!this.isOutOfStock(product)) {
      this.onAddToCart({ product, quantity: 1 });
    }
  }

  // Check if product is out of stock
  isOutOfStock(product: Product): boolean {
    if (product.availableQuantity === undefined || product.availableQuantity === null) {
      return false; // Assume available if stock info not available
    }
    return product.availableQuantity === 0;
  }

  // Check if product is low stock (less than 10 or less than 20% of MRP)
  isLowStock(product: Product): boolean {
    if (product.availableQuantity === undefined || product.availableQuantity === null) {
      return false;
    }
    if (product.availableQuantity === 0) {
      return false; // Out of stock, not low stock
    }
    // Consider low stock if less than 10 units or less than 5% of a reasonable threshold
    return product.availableQuantity < 10;
  }
}
