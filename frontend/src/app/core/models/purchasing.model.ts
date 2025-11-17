/**
 * Purchase Order and GRN Models
 */

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  totalGst: number;
  remarks?: string;
  items: PurchaseOrderItem[];
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseOrderItem {
  id?: string;
  productId: string;
  productName?: string;
  productSKU?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  gstRate: number;
  gstAmount: number;
  totalPrice: number;
  remarks?: string;
}

export enum PurchaseOrderStatus {
  Draft = 0,
  Pending = 1,
  Approved = 2,
  Received = 3,
  Cancelled = 4,
}

export interface PurchaseOrderListResponse {
  items: PurchaseOrder[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface PurchaseOrderFilters {
  supplierId?: string;
  status?: PurchaseOrderStatus;
  orderDateFrom?: string;
  orderDateTo?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  expectedDeliveryDate?: string;
  remarks?: string;
  items: CreatePurchaseOrderItemRequest[];
}

export interface CreatePurchaseOrderItemRequest {
  productId: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  gstRate: number;
  remarks?: string;
}

export interface UpdatePurchaseOrderRequest {
  supplierId?: string;
  expectedDeliveryDate?: string;
  remarks?: string;
  items?: UpdatePurchaseOrderItemRequest[];
}

export interface UpdatePurchaseOrderItemRequest {
  id?: string;
  productId: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  gstRate: number;
  remarks?: string;
}

// GRN Models
export interface GoodsReceiveNote {
  id: string;
  grnNumber: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  supplierId: string;
  supplierName?: string;
  receiveDate: string;
  status: GRNStatus;
  invoiceNumber?: string;
  invoiceFilePath?: string;
  invoiceFileUrl?: string;
  totalAmount: number;
  totalGst: number;
  remarks?: string;
  items: GRNItem[];
  confirmedAt?: string;
  confirmedBy?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GRNItem {
  id?: string;
  purchaseOrderItemId?: string;
  productId: string;
  productName?: string;
  productSKU?: string;
  expectedQuantity: number;
  receivedQuantity: number;
  unit: string;
  unitCost: number;
  gstRate: number;
  gstAmount: number;
  totalCost: number;
  batchNumber?: string;
  expiryDate?: string;
  remarks?: string;
}

export enum GRNStatus {
  Draft = 0,
  Confirmed = 1,
  Cancelled = 2,
  Voided = 3,
}

export interface GRNListResponse {
  items: GoodsReceiveNote[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface GRNFilters {
  supplierId?: string;
  purchaseOrderId?: string;
  status?: GRNStatus;
  receiveDateFrom?: string;
  receiveDateTo?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateGRNRequest {
  purchaseOrderId?: string;
  supplierId: string;
  receiveDate: string;
  invoiceNumber?: string;
  remarks?: string;
  items: CreateGRNItemRequest[];
}

export interface CreateGRNItemRequest {
  purchaseOrderItemId?: string;
  productId: string;
  expectedQuantity: number;
  receivedQuantity: number;
  unit: string;
  unitCost: number;
  gstRate: number;
  batchNumber?: string;
  expiryDate?: string;
  remarks?: string;
}

export interface ConfirmGRNRequest {
  idempotencyKey?: string;
}

export interface ConfirmGRNResponse {
  grnId: string;
  stockUpdates: StockUpdate[];
  message: string;
}

export interface StockUpdate {
  productId: string;
  productName: string;
  quantityAdded: number;
  batchNumber?: string;
  expiryDate?: string;
}

// Supplier Models
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierListResponse {
  items: Supplier[];
  totalCount: number;
}

