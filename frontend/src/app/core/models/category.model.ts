export interface TaxSlabDto {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryDto {
  id: string;
  name: string;
  description?: string;
  taxSlabId: string;
  taxSlab?: TaxSlabDto;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  taxSlabId: string;
}

export interface CategoryUpdateRequest extends Partial<CategoryCreateRequest> {
  id: string;
}

