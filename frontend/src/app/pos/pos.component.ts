import { Component, OnInit, OnDestroy, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, Subscription, debounceTime, distinctUntilChanged, firstValueFrom, switchMap, catchError, of } from 'rxjs';
import { PosService } from './pos.service';
import { VoiceToTextService, VoiceCommand } from '../core/services/voice-to-text.service';
import { CacheService } from '../core/services/cache.service';
import { Product, Category, CartItem, SaleRequest } from '../core/models/product.model';
import { SaleResponse } from '../core/models/product.model';
import { ProductTileComponent } from '../shared/components/product-tile/product-tile.component';
import { BarcodeInputComponent } from '../shared/components/barcode-input/barcode-input.component';
import { QuantityPickerComponent } from '../shared/components/quantity-picker/quantity-picker.component';
import { CategoryMultiselectComponent } from '../shared/components/category-multiselect/category-multiselect.component';

@Component({
  selector: 'grocery-pos',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule,
    MatTooltipModule,
    ProductTileComponent, 
    BarcodeInputComponent,
    QuantityPickerComponent,
    CategoryMultiselectComponent
  ],
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css'],
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
    this.subscriptions.add(
      this.searchSubject
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((term) => {
            if (term.trim()) {
              // Use switchMap to cancel previous requests and prevent race conditions
              return this.posService.searchProducts(term).pipe(
                catchError((error) => {
                  console.error('Search failed:', error);
                  return of([]); // Return empty array on error
                })
              );
            } else {
              // Reload all products when search is cleared
              return this.posService.getProducts().pipe(
                catchError((error) => {
                  console.error('Failed to reload products:', error);
                  return of([]);
                })
              );
            }
          })
        )
        .subscribe((products) => {
          // Update filtered products (results are already in correct order due to switchMap)
          this.products.set(products);
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
        this.checkout();
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

  async checkout(): Promise<void> {
    const currentCart = this.cart();
    if (currentCart.length === 0) {
      return;
    }

    this.isProcessingSale.set(true);

    // Generate invoice number (format: INV-YYYYMMDD-HHMMSS)
    const now = new Date();
    const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    const saleRequest: SaleRequest = {
      invoiceNumber: invoiceNumber,
      items: currentCart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.salePrice,
      })),
      discountAmount: 0,
    };

    try {
      const response = await firstValueFrom(this.posService.createSale(saleRequest));
      if (response) {
        this.lastSaleResponse.set(response);
        this.cart.set([]);
        this.customerPhone.set('');
        this.cache.invalidatePattern('products');
      }
    } catch (error: any) {
      console.error('Checkout failed:', error);
      // Show error to user (you can add toast notification here)
      alert('Checkout failed: ' + (error.error?.message || error.message || 'Unknown error'));
    } finally {
      this.isProcessingSale.set(false);
    }
  }

  downloadInvoice(): void {
    const response = this.lastSaleResponse();
    if (response?.pdfUrl) {
      window.open(response.pdfUrl, '_blank');
    }
  }
}
