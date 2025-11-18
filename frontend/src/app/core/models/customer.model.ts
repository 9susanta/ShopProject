export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  loyaltyPoints?: number;
  payLaterBalance?: number;
  payLaterLimit?: number;
  isPayLaterEnabled?: boolean;
  preferredPaymentMethod?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  totalOrders?: number;
  totalSpent?: number;
}

export interface CustomerSavedItem {
  id: string;
  customerId: string;
  productId: string;
  productName: string;
  productSKU: string;
  productPrice?: number;
  purchaseCount: number;
  lastPurchasedAt: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface PayLaterLedgerEntry {
  id: string;
  customerId: string;
  customerName: string;
  transactionType: string; // 'Sale' | 'Payment'
  amount: number;
  balanceAfter: number;
  saleId?: string;
  saleInvoiceNumber?: string;
  description?: string;
  createdAt: string;
}

export interface CustomerListResponse {
  items: Customer[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface UpdateCustomerRequest {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isActive: boolean;
}

export interface PayLaterBalance {
  customerId: string;
  balance: number;
  limit: number;
  isEnabled: boolean;
  availableCredit: number;
}

