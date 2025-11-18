export enum OfferType {
  BuyOneGetOne = 0,
  PercentageDiscount = 1,
  FlatDiscount = 2,
  QuantityBasedDiscount = 3,
  CouponCode = 4,
  FestivalSale = 5,
}

export interface Offer {
  id: string;
  name: string;
  description?: string;
  type: OfferType;
  typeName: string;
  discountValue: number;
  minQuantity?: number;
  maxQuantity?: number;
  productId?: string;
  productName?: string;
  categoryId?: string;
  categoryName?: string;
  couponCode?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isValid: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOfferRequest {
  name: string;
  description?: string;
  type: OfferType;
  discountValue: number;
  minQuantity?: number;
  maxQuantity?: number;
  productId?: string;
  categoryId?: string;
  couponCode?: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdateOfferRequest extends CreateOfferRequest {
  id: string;
}

