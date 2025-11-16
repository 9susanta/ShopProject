export enum SaleStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum PaymentMethod {
  Cash = 'Cash',
  UPI = 'UPI',
  Card = 'Card',
  PayLater = 'PayLater',
  Split = 'Split',
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount?: number;
  gstAmount?: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  status: SaleStatus;
  saleDate: string;
  items: SaleItem[];
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  notes?: string;
}

export interface CreateSaleRequest {
  customerId?: string;
  customerPhone?: string;
  items: SaleItemRequest[];
  discountAmount?: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  notes?: string;
}

export interface SaleItemRequest {
  productId?: string;
  barcode?: string;
  quantity: number;
  unitPrice?: number;
  discountAmount?: number;
}

export interface CheckoutRequest {
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  enablePayLater?: boolean;
  notes?: string;
}

