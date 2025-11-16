export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  mrp: number;
  salePrice: number;
  gstRate: number;
  categoryId: string;
  categoryName?: string;
  supplierId?: string;
  supplierName?: string;
  unitId: string;
  unitName?: string;
  description?: string;
  imageUrl?: string;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Optional: Available stock quantity (if inventory data is included)
  availableQuantity?: number;
}

export interface ProductCreateRequest {
  name: string;
  sku: string;
  barcode?: string;
  mrp: number;
  salePrice: number;
  categoryId: string;
  taxSlabId?: string; // Optional - will be auto-filled from category if not provided
  unitId: string;
  description?: string;
  image?: File;
  lowStockThreshold: number;
  isActive?: boolean;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: string;
}

export interface ProductListResponse {
  items: Product[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface SaleRequest {
  invoiceNumber?: string;
  customerId?: string;
  customerPhone?: string;
  discountAmount?: number;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymentMethod?: string;
}

export interface SaleResponse {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  saleDate: string;
}
