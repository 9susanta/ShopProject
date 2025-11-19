export interface TaxSlabDto {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxSlabCreateRequest {
  name: string;
  rate: number;
  isDefault?: boolean;
}

export interface TaxSlabUpdateRequest extends Partial<TaxSlabCreateRequest> {
  id: string;
}

