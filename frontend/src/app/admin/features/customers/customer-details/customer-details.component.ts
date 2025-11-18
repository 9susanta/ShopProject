import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PayLaterPaymentDialogComponent, PayLaterPaymentDialogData } from '../pay-later-payment-dialog/pay-later-payment-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '@core/services/customer.service';
import { ToastService } from '@core/toast/toast.service';
import { Customer, CustomerSavedItem, PayLaterLedgerEntry } from '@core/models/customer.model';

@Component({
  selector: 'grocery-customer-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTableModule,
    MatTabsModule,
    MatPaginatorModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    FormsModule,
  ],
  template: `
    <div class="customer-details-container p-4 max-w-6xl mx-auto">
      <div class="mb-4">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Customers
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (customer()) {
        <!-- Customer Summary Card -->
        <mat-card class="mb-4">
          <mat-card-header>
            <mat-card-title>{{ customer()!.name }}</mat-card-title>
            <mat-card-subtitle>
              <div class="flex items-center gap-2">
                @if (customer()!.isActive) {
                  <mat-chip color="primary">Active</mat-chip>
                } @else {
                  <mat-chip color="warn">Inactive</mat-chip>
                }
                @if ((customer()!.loyaltyPoints ?? 0) > 0) {
                  <mat-chip color="accent">
                    <mat-icon class="text-sm">stars</mat-icon>
                    {{ customer()!.loyaltyPoints }} Points
                  </mat-chip>
                }
                @if (customer()!.isPayLaterEnabled) {
                  <mat-chip [color]="customer()!.payLaterBalance! > 0 ? 'warn' : 'primary'">
                    Pay Later: {{ customer()!.payLaterBalance | currency: 'INR' }} / {{ customer()!.payLaterLimit | currency: 'INR' }}
                  </mat-chip>
                }
              </div>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <strong>Phone:</strong> {{ customer()!.phone || 'N/A' }}
              </div>
              <div>
                <strong>Email:</strong> {{ customer()!.email || 'N/A' }}
              </div>
              <div>
                <strong>Total Orders:</strong> {{ customer()!.totalOrders || 0 }}
              </div>
              <div>
                <strong>Total Spent:</strong> {{ customer()!.totalSpent | currency: 'INR' }}
              </div>
              <div class="md:col-span-2 lg:col-span-4">
                <strong>Address:</strong> {{ customer()!.address || 'N/A' }}
                @if (customer()!.city) {
                  , {{ customer()!.city }}
                }
                @if (customer()!.pincode) {
                  - {{ customer()!.pincode }}
                }
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Tabs for Purchase History, Ledger, Saved Items -->
        <mat-tab-group [selectedIndex]="selectedTab()" (selectedIndexChange)="selectedTab.set($event)">
          <!-- Purchase History Tab -->
          <mat-tab label="Purchase History">
            <mat-card class="mt-4">
              <mat-card-content>
                @if (purchaseHistoryLoading()) {
                  <div class="flex justify-center p-8">
                    <mat-spinner diameter="30"></mat-spinner>
                  </div>
                } @else if (purchaseHistory().length === 0) {
                  <div class="text-center py-8 text-gray-500">No purchase history found</div>
                } @else {
                  <table mat-table [dataSource]="purchaseHistory()" class="w-full">
                    <ng-container matColumnDef="invoiceNumber">
                      <th mat-header-cell *matHeaderCellDef>Invoice</th>
                      <td mat-cell *matCellDef="let sale">{{ sale.invoiceNumber }}</td>
                    </ng-container>
                    <ng-container matColumnDef="saleDate">
                      <th mat-header-cell *matHeaderCellDef>Date</th>
                      <td mat-cell *matCellDef="let sale">{{ sale.saleDate | date: 'short' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="totalAmount">
                      <th mat-header-cell *matHeaderCellDef>Amount</th>
                      <td mat-cell *matCellDef="let sale">{{ sale.totalAmount | currency: 'INR' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="paymentMethod">
                      <th mat-header-cell *matHeaderCellDef>Payment</th>
                      <td mat-cell *matCellDef="let sale">{{ sale.paymentMethod }}</td>
                    </ng-container>
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let sale">
                        <button mat-icon-button (click)="viewSale(sale.id)" matTooltip="View Details">
                          <mat-icon>visibility</mat-icon>
                        </button>
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="purchaseHistoryColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: purchaseHistoryColumns"></tr>
                  </table>
                  <mat-paginator
                    [length]="purchaseHistoryTotal()"
                    [pageSize]="purchaseHistoryPageSize()"
                    [pageIndex]="purchaseHistoryPage() - 1"
                    [pageSizeOptions]="[10, 20, 50]"
                    (page)="onPurchaseHistoryPageChange($event)"
                    showFirstLastButtons>
                  </mat-paginator>
                }
              </mat-card-content>
            </mat-card>
          </mat-tab>

          <!-- Pay Later Ledger Tab -->
          <mat-tab label="Pay Later Ledger">
            <div class="mt-4">
              @if (customer() && customer()!.isPayLaterEnabled && customer()!.payLaterBalance! > 0) {
                <div class="mb-4">
                  <button mat-raised-button color="primary" (click)="openPaymentDialog()">
                    <mat-icon>payment</mat-icon>
                    Record Payment
                  </button>
                </div>
              }
              <mat-card>
                <mat-card-content>
                  @if (ledgerLoading()) {
                    <div class="flex justify-center p-8">
                      <mat-spinner diameter="30"></mat-spinner>
                    </div>
                  } @else if (payLaterLedger().length === 0) {
                    <div class="text-center py-8 text-gray-500">No ledger entries found</div>
                  } @else {
                  <table mat-table [dataSource]="payLaterLedger()" class="w-full">
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Date</th>
                      <td mat-cell *matCellDef="let entry">{{ entry.createdAt | date: 'short' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef>Type</th>
                      <td mat-cell *matCellDef="let entry">
                        <mat-chip [color]="entry.transactionType === 'Sale' ? 'warn' : 'primary'">
                          {{ entry.transactionType }}
                        </mat-chip>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef>Amount</th>
                      <td mat-cell *matCellDef="let entry" [class.text-red-600]="entry.transactionType === 'Sale'">
                        {{ entry.transactionType === 'Sale' ? '-' : '+' }}{{ entry.amount | currency: 'INR' }}
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="balance">
                      <th mat-header-cell *matHeaderCellDef>Balance</th>
                      <td mat-cell *matCellDef="let entry">{{ entry.balanceAfter | currency: 'INR' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="description">
                      <th mat-header-cell *matHeaderCellDef>Description</th>
                      <td mat-cell *matCellDef="let entry">
                        {{ entry.description || entry.saleInvoiceNumber || 'N/A' }}
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="ledgerColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: ledgerColumns"></tr>
                  </table>
                  <mat-paginator
                    [length]="ledgerTotal()"
                    [pageSize]="ledgerPageSize()"
                    [pageIndex]="ledgerPage() - 1"
                    [pageSizeOptions]="[10, 20, 50]"
                    (page)="onLedgerPageChange($event)"
                    showFirstLastButtons>
                  </mat-paginator>
                  }
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Saved Items Tab -->
          <mat-tab label="Saved Items">
            <mat-card class="mt-4">
              <mat-card-content>
                @if (savedItemsLoading()) {
                  <div class="flex justify-center p-8">
                    <mat-spinner diameter="30"></mat-spinner>
                  </div>
                } @else if (savedItems().length === 0) {
                  <div class="text-center py-8 text-gray-500">No saved items found</div>
                } @else {
                  <table mat-table [dataSource]="savedItems()" class="w-full">
                    <ng-container matColumnDef="product">
                      <th mat-header-cell *matHeaderCellDef>Product</th>
                      <td mat-cell *matCellDef="let item">
                        <div>
                          <div class="font-semibold">{{ item.productName }}</div>
                          <div class="text-sm text-gray-500">{{ item.productSKU }}</div>
                        </div>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="purchaseCount">
                      <th mat-header-cell *matHeaderCellDef>Purchased</th>
                      <td mat-cell *matCellDef="let item">{{ item.purchaseCount }} times</td>
                    </ng-container>
                    <ng-container matColumnDef="lastPurchased">
                      <th mat-header-cell *matHeaderCellDef>Last Purchased</th>
                      <td mat-cell *matCellDef="let item">{{ item.lastPurchasedAt | date: 'short' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let item">
                        <button mat-icon-button (click)="viewProduct(item.productId)" [matTooltip]="'View Product'">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button (click)="navigateToPOS(item.productId)" [matTooltip]="'Add to POS Cart'">
                          <mat-icon>add_shopping_cart</mat-icon>
                        </button>
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="savedItemsColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: savedItemsColumns"></tr>
                  </table>
                  <mat-paginator
                    [length]="savedItemsTotal()"
                    [pageSize]="savedItemsPageSize()"
                    [pageIndex]="savedItemsPage() - 1"
                    [pageSizeOptions]="[20, 50, 100]"
                    (page)="onSavedItemsPageChange($event)"
                    showFirstLastButtons>
                  </mat-paginator>
                }
              </mat-card-content>
            </mat-card>
          </mat-tab>
        </mat-tab-group>
      } @else {
        <mat-card>
          <mat-card-content>
            <div class="text-center py-8">
              <mat-icon class="text-6xl text-gray-400 mb-4">person</mat-icon>
              <h2 class="text-xl font-semibold mb-2">Customer not found</h2>
              <p class="text-gray-500">The customer you're looking for doesn't exist.</p>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .customer-details-container {
      min-height: calc(100vh - 64px);
    }
  `]
})
export class CustomerDetailsComponent implements OnInit {
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  customer = signal<Customer | null>(null);
  loading = signal(false);
  
  // Purchase history
  purchaseHistory = signal<any[]>([]);
  purchaseHistoryLoading = signal(false);
  purchaseHistoryTotal = signal(0);
  purchaseHistoryPage = signal(1);
  purchaseHistoryPageSize = signal(20);
  
  // Pay later ledger
  payLaterLedger = signal<PayLaterLedgerEntry[]>([]);
  ledgerLoading = signal(false);
  ledgerTotal = signal(0);
  ledgerPage = signal(1);
  ledgerPageSize = signal(20);
  
  // Saved items
  savedItems = signal<CustomerSavedItem[]>([]);
  savedItemsLoading = signal(false);
  savedItemsTotal = signal(0);
  savedItemsPage = signal(1);
  savedItemsPageSize = signal(50);
  
  selectedTab = signal(0); // Use number, not signal for two-way binding
  
  purchaseHistoryColumns = ['invoiceNumber', 'saleDate', 'totalAmount', 'paymentMethod', 'actions'];
  ledgerColumns = ['date', 'type', 'amount', 'balance', 'description'];
  savedItemsColumns = ['product', 'purchaseCount', 'lastPurchased', 'actions'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCustomer(id);
    } else {
      this.toastService.error('Customer ID is required');
      this.goBack();
    }
  }

  loadCustomer(id: string): void {
    this.loading.set(true);
    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.loading.set(false);
        // Load related data
        this.loadPurchaseHistory(id);
        this.loadPayLaterLedger(id);
        this.loadSavedItems(id);
      },
      error: (error) => {
        this.toastService.error('Failed to load customer');
        this.loading.set(false);
        console.error(error);
      },
    });
  }

  loadPurchaseHistory(customerId: string): void {
    this.purchaseHistoryLoading.set(true);
    this.customerService.getCustomerPurchaseHistory(customerId, {
      pageNumber: this.purchaseHistoryPage(),
      pageSize: this.purchaseHistoryPageSize(),
    }).subscribe({
      next: (response) => {
        this.purchaseHistory.set(response.items || []);
        this.purchaseHistoryTotal.set(response.totalCount || 0);
        this.purchaseHistoryLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading purchase history:', error);
        this.purchaseHistoryLoading.set(false);
      },
    });
  }

  loadPayLaterLedger(customerId: string): void {
    this.ledgerLoading.set(true);
    this.customerService.getCustomerPayLaterLedger(customerId, {
      pageNumber: this.ledgerPage(),
      pageSize: this.ledgerPageSize(),
    }).subscribe({
      next: (response) => {
        this.payLaterLedger.set(response.items || []);
        this.ledgerTotal.set(response.totalCount || 0);
        this.ledgerLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading pay later ledger:', error);
        this.ledgerLoading.set(false);
      },
    });
  }

  loadSavedItems(customerId: string): void {
    this.savedItemsLoading.set(true);
    this.customerService.getCustomerSavedItems(customerId, {
      pageNumber: this.savedItemsPage(),
      pageSize: this.savedItemsPageSize(),
    }).subscribe({
      next: (response) => {
        this.savedItems.set(response.items || []);
        this.savedItemsTotal.set(response.totalCount || 0);
        this.savedItemsLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading saved items:', error);
        this.savedItemsLoading.set(false);
      },
    });
  }

  onPurchaseHistoryPageChange(event: PageEvent): void {
    this.purchaseHistoryPage.set(event.pageIndex + 1);
    this.purchaseHistoryPageSize.set(event.pageSize);
    if (this.customer()) {
      this.loadPurchaseHistory(this.customer()!.id);
    }
  }

  onLedgerPageChange(event: PageEvent): void {
    this.ledgerPage.set(event.pageIndex + 1);
    this.ledgerPageSize.set(event.pageSize);
    if (this.customer()) {
      this.loadPayLaterLedger(this.customer()!.id);
    }
  }

  onSavedItemsPageChange(event: PageEvent): void {
    this.savedItemsPage.set(event.pageIndex + 1);
    this.savedItemsPageSize.set(event.pageSize);
    if (this.customer()) {
      this.loadSavedItems(this.customer()!.id);
    }
  }

  viewSale(saleId: string): void {
    this.router.navigate(['/admin/sales', saleId]);
  }

  openPaymentDialog(): void {
    const customer = this.customer();
    if (!customer || !customer.isPayLaterEnabled) {
      this.toastService.warning('Pay Later is not enabled for this customer');
      return;
    }

    const dialogData: PayLaterPaymentDialogData = {
      customerId: customer.id,
      customerName: customer.name,
      currentBalance: customer.payLaterBalance || 0,
      limit: customer.payLaterLimit || 0,
      availableCredit: Math.max(0, (customer.payLaterLimit || 0) - (customer.payLaterBalance || 0)),
    };

    const dialogRef = this.dialog.open(PayLaterPaymentDialogComponent, {
      width: '600px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result: PayLaterLedgerEntry | undefined) => {
      if (result) {
        // Reload customer data and ledger
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.loadCustomer(id);
          this.loadPayLaterLedger(id);
        }
      }
    });
  }

  viewProduct(productId: string): void {
    this.router.navigate(['/admin/products', productId]);
  }

  navigateToPOS(productId: string): void {
    // Navigate to POS with product ID as query param
    this.router.navigate(['/pos'], { queryParams: { productId } });
    this.toastService.info('Navigating to POS. Product will be added to cart.');
  }

  goBack(): void {
    this.router.navigate(['/admin/customers']);
  }
}

