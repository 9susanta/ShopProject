export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  grnId?: string;
  grnNumber?: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface OutstandingPayment {
  supplierId: string;
  supplierName: string;
  totalOutstanding: number;
  unpaidOrders: number;
  unpaidGRNs: number;
  lastPaymentDate?: string;
}

export interface CreateSupplierPaymentRequest {
  supplierId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  purchaseOrderId?: string;
  grnId?: string;
  referenceNumber?: string;
  notes?: string;
}

