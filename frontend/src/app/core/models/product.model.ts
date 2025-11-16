export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  categoryId?: string;
  categoryName?: string;
  supplierId?: string;
  supplierName?: string;
  barcode?: string;
  imageUrl?: string;
  sku?: string;
  unit?: string;
  lowStockThreshold?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface SaleRequest {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  customerPhone?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface SaleResponse {
  id: string;
  total: number;
  invoiceUrl?: string;
  pdfUrl?: string;
  createdAt: string;
}


