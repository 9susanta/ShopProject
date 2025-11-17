/**
 * Inventory Batch and Extended Inventory Models
 */

export interface InventoryBatch {
  id: string;
  productId: string;
  productName?: string;
  productSKU?: string;
  batchNumber: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  unitCost: number;
  expiryDate?: string;
  location?: string;
  createdAt: string;
  updatedAt?: string;
  isExpiringSoon?: boolean;
  daysUntilExpiry?: number;
}

export interface ProductInventory {
  id: string;
  productId: string;
  productName: string;
  productSKU: string;
  categoryId?: string;
  categoryName?: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  lowStockThreshold?: number;
  isLowStock: boolean;
  batches: InventoryBatch[];
  lastUpdatedAt: string;
}

export interface ProductInventoryListResponse {
  items: ProductInventory[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface LowStockProduct {
  productId: string;
  productName: string;
  productSKU: string;
  currentStock: number;
  threshold: number;
  unit: string;
  categoryName?: string;
}

export interface LowStockListResponse {
  items: LowStockProduct[];
  totalCount: number;
}

export interface ExpirySoonBatch {
  batchId: string;
  productId: string;
  productName: string;
  productSKU: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  daysUntilExpiry: number;
  unitCost: number;
  location?: string;
}

export interface ExpirySoonListResponse {
  items: ExpirySoonBatch[];
  totalCount: number;
  daysAhead: number;
}

export interface StockValuation {
  totalSKUs: number;
  totalStockValue: number;
  totalQuantity: number;
  lowStockCount: number;
  expirySoonCount: number;
  valuationMethod: 'FIFO' | 'LIFO' | 'WeightedAverage';
  breakdownByCategory?: CategoryValuation[];
}

export interface CategoryValuation {
  categoryId: string;
  categoryName: string;
  skuCount: number;
  totalValue: number;
  totalQuantity: number;
}

export interface InventoryAdjustment {
  id: string;
  productId: string;
  productName?: string;
  batchId?: string;
  batchNumber?: string;
  adjustmentType: InventoryAdjustmentType;
  quantityChange: number;
  reason: string;
  notes?: string;
  linkedGRNId?: string;
  linkedSaleId?: string;
  adjustedBy: string;
  adjustedByName?: string;
  adjustedAt: string;
}

export enum InventoryAdjustmentType {
  Purchase = 0,
  Sale = 1,
  Manual = 2,
  Damage = 3,
  Expiry = 4,
  SupplierReturn = 5,
  CustomerReturn = 6,
  StockTake = 7,
  Transfer = 8,
}

export interface CreateAdjustmentRequest {
  productId: string;
  batchId?: string;
  adjustmentType: InventoryAdjustmentType;
  quantityChange: number;
  reason: string;
  notes?: string;
  linkedGRNId?: string;
  linkedSaleId?: string;
}

export interface AdjustmentListResponse {
  items: InventoryAdjustment[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface AdjustmentFilters {
  productId?: string;
  batchId?: string;
  adjustmentType?: InventoryAdjustmentType;
  adjustedBy?: string;
  adjustedAtFrom?: string;
  adjustedAtTo?: string;
  pageNumber?: number;
  pageSize?: number;
}

