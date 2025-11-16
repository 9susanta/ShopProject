import { Component, OnInit, OnDestroy, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Subject, Subscription, debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { PosService } from './pos.service';
import { VoiceToTextService, VoiceCommand } from '../core/services/voice-to-text.service';
import { CacheService } from '../core/services/cache.service';
import { Product, Category, CartItem, SaleRequest } from '../core/models/product.model';
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
    ProductTileComponent, 
    BarcodeInputComponent,
    QuantityPickerComponent,
    CategoryMultiselectComponent
  ],
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css'],
})
export class PosComponent implements OnInit, OnDestroy {
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
          p.description?.toLowerCase().includes(term) ||
          p.barcode?.toLowerCase().includes(term)
      );
    }

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
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe((term) => {
          if (term.trim()) {
            this.posService.searchProducts(term).subscribe({
              next: (products) => {
                // Update filtered products
                this.products.update(current => {
                  // Merge search results with current products
                  return products;
                });
              },
              error: (error) => {
                console.error('Search failed:', error);
              },
            });
          } else {
            // Reload all products when search is cleared
            this.loadProducts();
          }
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
      const existingItem = currentCart.find(
        (item) => item.product.id === event.product.id
      );

      if (existingItem) {
        existingItem.quantity += event.quantity;
        existingItem.subtotal = existingItem.product.price * existingItem.quantity;
        return [...currentCart];
      } else {
        return [
          ...currentCart,
          {
            product: event.product,
            quantity: event.quantity,
            subtotal: event.product.price * event.quantity,
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
          currentCart[index].quantity = quantity;
          currentCart[index].subtotal = item.product.price * quantity;
        }
        return [...currentCart];
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
    this.subscriptions.add(
      this.posService.getProductByBarcode(barcode).subscribe({
        next: (product) => {
          this.onAddToCart({ product, quantity: 1 });
        },
        error: (error) => {
          console.error('Barcode scan failed:', error);
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

    const saleRequest: SaleRequest = {
      items: currentCart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      customerPhone: this.customerPhone() || undefined,
      paymentMethod: 'cash',
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
