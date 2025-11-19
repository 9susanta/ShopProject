import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BarcodePrintService } from '@core/services/barcode-print.service';
import { ProductService } from '../../admin/products/services/product.service';
import { ToastService } from '@core/toast/toast.service';
import { Product } from '@core/models/product.model';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'grocery-barcode-printing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="admin-page-container">
      <div class="admin-page-header">
        <h1>Barcode Printing</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <form (ngSubmit)="onPrint()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="md:col-span-2">
                <mat-label>Product</mat-label>
                <input 
                  matInput 
                  [formControl]="productControl"
                  [matAutocomplete]="auto"
                  placeholder="Search product by name or SKU">
                <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayProduct">
                  @for (product of filteredProducts$ | async; track product.id) {
                    <mat-option [value]="product">
                      {{ product.name }} ({{ product.sku }})
                    </mat-option>
                  }
                </mat-autocomplete>
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Quantity</mat-label>
                <input matInput type="number" [(ngModel)]="quantity" name="quantity" min="1" required>
                <mat-icon matSuffix>confirmation_number</mat-icon>
              </mat-form-field>

              @if (selectedProduct()) {
                <div class="flex items-center">
                  <div>
                    <div class="font-semibold">{{ selectedProduct()?.name }}</div>
                    <div class="text-sm text-gray-500">SKU: {{ selectedProduct()?.sku }}</div>
                    @if (selectedProduct()?.barcode) {
                      <div class="text-sm text-gray-500">Barcode: {{ selectedProduct()?.barcode }}</div>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="flex justify-end gap-4 mt-6">
              <button mat-raised-button color="primary" type="submit" [disabled]="!selectedProduct() || printing()">
                @if (printing()) {
                  <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                } @else {
                  <mat-icon>print</mat-icon>
                }
                Print Barcode
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    .admin-page-header {
      margin-bottom: 24px;
    }
    .admin-page-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  `]
})
export class BarcodePrintingComponent implements OnInit {
  private barcodePrintService = inject(BarcodePrintService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  productControl = new FormControl('');
  selectedProduct = signal<Product | null>(null);
  quantity = 1;
  printing = signal(false);
  products = signal<Product[]>([]);
  filteredProducts$!: Observable<Product[]>;

  ngOnInit(): void {
    this.loadProducts();
    
    this.filteredProducts$ = this.productControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (typeof value === 'string') {
          return this.filterProducts(value);
        }
        if (value && typeof value === 'object' && 'name' in value) {
          return this.filterProducts((value as Product).name);
        }
        return this.filterProducts('');
      })
    );

    this.productControl.valueChanges.subscribe(value => {
      if (value && typeof value === 'object' && 'id' in value) {
        this.selectedProduct.set(value as Product);
      } else {
        this.selectedProduct.set(null);
      }
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products.set(response.items || response);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      },
    });
  }

  filterProducts(searchTerm: string): Product[] {
    if (!searchTerm) {
      return this.products().slice(0, 10);
    }
    const term = searchTerm.toLowerCase();
    return this.products().filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.barcode?.toLowerCase().includes(term)
    ).slice(0, 10);
  }

  displayProduct(product: Product | null): string {
    return product ? `${product.name} (${product.sku})` : '';
  }

  onPrint(): void {
    if (!this.selectedProduct()) {
      this.toastService.warning('Please select a product');
      return;
    }

    this.printing.set(true);
    this.barcodePrintService.printBarcode(this.selectedProduct()!.id, this.quantity).subscribe({
      next: (response) => {
        this.toastService.success(response.message || 'Barcode printed successfully');
        this.printing.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to print barcode');
        console.error('Error printing barcode:', error);
        this.printing.set(false);
      },
    });
  }
}

