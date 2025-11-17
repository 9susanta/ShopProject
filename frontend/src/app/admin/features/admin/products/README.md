# Product Management Module

This module provides complete product creation and management functionality for the Grocery Store Management System.

## Components

### ProductCreateComponent
Main component for creating new products with full form validation, master data integration, and image upload support.

**Route:** `/admin/products/new`

**Features:**
- Reactive form with comprehensive validation
- Auto-fill tax slab from selected category
- Barcode scanning support (keyboard-wedge and camera)
- Duplicate product detection by barcode
- Image upload with drag-and-drop
- Category creation modal
- Master data caching

### CategoryCreateModalComponent
Modal component for creating new categories on-the-fly from the product form.

**Features:**
- Inline category creation
- Auto-select newly created category
- Tax slab assignment
- Focus trapping and keyboard navigation

## Services

### ProductService
Handles all product-related API calls:
- `getProducts(filters)` - Get paginated product list
- `getProductById(id)` - Get single product
- `getProductByBarcode(barcode)` - Lookup by barcode
- `createProduct(product)` - Create new product (supports FormData for images)
- `updateProduct(product)` - Update existing product
- `deleteProduct(id)` - Delete product

### MasterDataService
Centralized caching service for master data:
- `getCategories(forceRefresh)` - Get categories (cached)
- `getTaxSlabs(forceRefresh)` - Get tax slabs (cached)
- `getUnits(forceRefresh)` - Get units (cached)
- `refreshAll()` - Refresh all master data
- `addCategoryToCache(category)` - Add new category to cache

### CategoryService
Category management:
- `getCategories(isActive?)` - Get all categories
- `getCategoryById(id)` - Get category by ID
- `createCategory(category)` - Create new category
- `updateCategory(category)` - Update category

### TaxSlabService
Tax slab management:
- `getTaxSlabs(isActive)` - Get all tax slabs
- `createTaxSlab(taxSlab)` - Create new tax slab
- `updateTaxSlab(taxSlab)` - Update tax slab

### UnitService
Unit management:
- `getUnits(isActive)` - Get all units

## Models

### ProductCreateRequest
```typescript
{
  name: string;
  sku: string;
  barcode?: string;
  mrp: number;
  salePrice: number;
  categoryId: string;
  taxSlabId?: string; // Optional - auto-filled from category
  unitId: string;
  description?: string;
  image?: File;
  lowStockThreshold: number;
  isActive?: boolean;
}
```

### CategoryDto
```typescript
{
  id: string;
  name: string;
  description?: string;
  taxSlabId: string;
  taxSlab?: TaxSlabDto; // Linked tax slab for product form
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

## API Endpoints

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `GET /api/taxslabs` - Get all tax slabs
- `GET /api/units` - Get all units
- `GET /api/products/search?barcode={code}` - Search by barcode
- `POST /api/products` - Create product (JSON or FormData)

## Configuration

### Environment Setup
Ensure `environment.ts` has the correct API URL:
```typescript
export const environment = {
  apiUrl: 'http://localhost:5120/api',
  // ... other config
};
```

### Running the Component
1. Start the backend API server
2. Start the Angular dev server: `npm start`
3. Navigate to `/admin/products/new`
4. Ensure you're logged in as an admin user

## Testing

Run unit tests:
```bash
npm test
```

The test suite includes:
- Form initial state validation
- Auto-fill tax slab from category
- Product creation with correct payload
- Sale price validation (must be <= MRP)
- Duplicate barcode detection

## Accessibility

- All form fields have proper `aria-label` and `aria-required` attributes
- Modal dialogs trap focus
- Keyboard navigation supported (ESC to close modals)
- Screen reader friendly labels and error messages

## Dependencies

- Angular Material (Forms, Dialog, Snackbar, Icons)
- RxJS (Observables, operators)
- Angular Reactive Forms
- Angular Router

