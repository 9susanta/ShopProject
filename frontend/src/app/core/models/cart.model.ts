export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discountAmount?: number;
}

export interface Cart {
  items: CartItem[];
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}

