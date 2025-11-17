/**
 * Audit Log Models
 */

export interface InventoryAuditLog {
  id: string;
  productId: string;
  productName?: string;
  batchId?: string;
  batchNumber?: string;
  action: AuditAction;
  oldValue?: string;
  newValue?: string;
  quantityChange?: number;
  reason?: string;
  performedBy: string;
  performedByName?: string;
  performedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export enum AuditAction {
  StockIncrease = 'StockIncrease',
  StockDecrease = 'StockDecrease',
  BatchCreated = 'BatchCreated',
  BatchUpdated = 'BatchUpdated',
  BatchExpired = 'BatchExpired',
  GRNConfirmed = 'GRNConfirmed',
  Adjustment = 'Adjustment',
  ReturnToSupplier = 'ReturnToSupplier',
  CustomerReturn = 'CustomerReturn',
}

export interface AuditLogListResponse {
  items: InventoryAuditLog[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLogFilters {
  productId?: string;
  batchId?: string;
  action?: AuditAction;
  performedBy?: string;
  performedAtFrom?: string;
  performedAtTo?: string;
  pageNumber?: number;
  pageSize?: number;
}

