export interface Inventory {
  id: string;
  productId: string;
  productName?: string;
  quantityOnHand: number;
  availableQuantity: number;
  reservedQuantity: number;
  expiryDate?: string;
  batchNumber?: string;
  location?: string;
  lastUpdatedAt?: string;
}

export interface InventoryAdjustment {
  id: string;
  inventoryId: string;
  productId: string;
  quantityChange: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: string;
  notes?: string;
}

export interface InventoryAdjustRequest {
  inventoryId: string;
  quantityChange: number;
  reason: string;
  notes?: string;
}

export interface InventoryListResponse {
  items: Inventory[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface InventoryFilters {
  productId?: string;
  categoryId?: string;
  supplierId?: string;
  lowStock?: boolean;
  expirySoon?: boolean;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  pageNumber?: number;
  pageSize?: number;
}

