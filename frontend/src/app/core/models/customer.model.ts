export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  totalOrders?: number;
  totalSpent?: number;
}

export interface CustomerListResponse {
  items: Customer[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface UpdateCustomerRequest {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isActive: boolean;
}

