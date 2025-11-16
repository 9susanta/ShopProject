export enum UnitType {
  Kilogram = 0,
  Gram = 1,
  Litre = 2,
  Millilitre = 3,
  Piece = 4,
  Pack = 5,
  Dozen = 6,
}

export interface UnitDto {
  id: string;
  name: string;
  symbol: string;
  type: UnitType;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

