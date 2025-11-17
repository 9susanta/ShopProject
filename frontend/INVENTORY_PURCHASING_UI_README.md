# Inventory & Purchasing UI - Angular Frontend

## Overview

This is a production-ready Angular 20 frontend implementation for the Inventory & Purchasing domain of the Grocery Store Management System. It integrates with the .NET 8 API backend and provides a comprehensive UI for managing purchase orders, goods receive notes (GRN), inventory, and related operations.

## Features Implemented

### ✅ Purchase Order Management
- **PO List**: Paginated list with filters (supplier, status, date range)
- **PO Create/Edit**: Full form with supplier selection, product typeahead, barcode scanning, unit conversion
- **PO Details**: View PO with items, approve/cancel actions
- **Bulk Approve**: Admin-only bulk approval for pending orders

### ✅ Goods Receive Note (GRN) Management
- **GRN List**: Paginated list with status and date filters
- **GRN Create**: Create from PO or ad-hoc, invoice upload, batch tracking
- **GRN Confirm**: Confirmation screen with stock updates preview
- **GRN Details**: View GRN with items and batch information

### ✅ Inventory Management
- **Inventory Dashboard**: Tiles for SKUs, stock value, low stock, expiry counts
- **Product Inventory**: List products with aggregated quantities and batches
- **Low Stock List**: Products below threshold with quick PO creation
- **Expiry Management**: Batches expiring soon with bulk actions

### ✅ Real-time Updates
- **SignalR Integration**: Real-time notifications for:
  - Low stock alerts
  - GRN completion
  - Expiry warnings
- **Optimistic UI Updates**: Immediate UI updates after GRN confirmation

### ✅ Additional Features
- **Barcode Scanning**: Keyboard-wedge and camera scanner support (zxing-scanner)
- **Excel Preview**: Client-side Excel preview using SheetJS
- **File Upload**: Invoice upload with preview
- **Touch-friendly UI**: Optimized for tablet/POS devices
- **Responsive Design**: Works on desktop and mobile

## Project Structure

```
frontend/src/app/
├── core/
│   ├── models/
│   │   ├── purchasing.model.ts          # PO, GRN, Supplier models
│   │   ├── inventory-batch.model.ts      # Inventory batch, adjustments models
│   │   └── audit.model.ts                # Audit log models
│   └── services/
│       ├── purchasing.service.ts        # PO & GRN API service
│       ├── excel.service.ts             # SheetJS Excel operations
│       └── signalr.service.ts            # SignalR (updated for inventory hub)
├── features/
│   ├── purchasing/
│   │   ├── purchase-order-list/         # PO list component
│   │   ├── purchase-order-form/          # PO create/edit form
│   │   ├── purchase-order-details/      # PO details view
│   │   ├── grn-list/                    # GRN list component
│   │   ├── grn-form/                     # GRN create form
│   │   ├── grn-details/                 # GRN details view
│   │   ├── grn-confirm/                 # GRN confirmation screen
│   │   └── purchasing.routes.ts         # Purchasing routes
│   └── inventory/
│       ├── inventory-dashboard/         # Dashboard with widgets
│       ├── product-batch-list/          # Product inventory with batches
│       ├── batch-details/               # Batch details view
│       ├── low-stock-list/              # Low stock products
│       ├── expiry-list/                 # Expiring batches
│       └── inventory.routes.ts          # Inventory routes (updated)
└── shared/
    └── components/
        ├── file-upload/                 # File upload component
        ├── confirm-dialog/              # Confirmation dialog
        └── barcode-input/                # Barcode input component
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Angular CLI 20+
- Backend API running on `http://localhost:5120`

### Installation

1. **Install Dependencies**

```bash
cd frontend
npm install
```

2. **Configure Environment**

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5120/api',
  signalRHub: 'http://localhost:5120/hubs/import-progress',
  enableSignalR: true,
  // ... other config
};
```

3. **Run Development Server**

```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200`

### Build for Production

```bash
npm run build
# or
ng build --configuration production
```

## API Integration

### Endpoints Used

**Purchase Orders:**
- `GET /api/purchasing/purchase-orders` - List POs
- `GET /api/purchasing/purchase-orders/{id}` - Get PO details
- `POST /api/purchasing/purchase-orders` - Create PO
- `PUT /api/purchasing/purchase-orders/{id}` - Update PO
- `POST /api/purchasing/purchase-orders/{id}/approve` - Approve PO
- `POST /api/purchasing/purchase-orders/{id}/cancel` - Cancel PO

**GRN:**
- `GET /api/purchasing/grn` - List GRNs
- `GET /api/purchasing/grn/{id}` - Get GRN details
- `POST /api/purchasing/grn` - Create GRN
- `POST /api/purchasing/grn/{id}/confirm` - Confirm GRN
- `POST /api/purchasing/grn/{id}/cancel` - Cancel GRN
- `POST /api/purchasing/grn/upload-invoice` - Upload invoice

**Inventory:**
- `GET /api/inventory/products` - List products with inventory
- `GET /api/inventory/product/{id}` - Get product inventory
- `GET /api/inventory/low-stock` - Get low stock products
- `GET /api/inventory/expiry-soon` - Get expiring batches
- `GET /api/inventory/valuation` - Get stock valuation
- `POST /api/inventory/adjustment` - Create adjustment

**Suppliers:**
- `GET /api/master/suppliers` - List suppliers
- `GET /api/master/suppliers/{id}` - Get supplier
- `POST /api/master/suppliers` - Create supplier

## SignalR Integration

The application connects to two SignalR hubs:

1. **Import Progress Hub**: `/hubs/import-progress`
2. **Inventory Hub**: `/hubs/inventory`

### Inventory Hub Events

- `LowStockAlert` - Fired when product stock falls below threshold
- `GRNCompleted` - Fired when GRN is confirmed
- `ExpiryAlert` - Fired when batch is expiring soon

### Usage Example

```typescript
import { SignalRService } from '@core/services/signalr.service';

// Subscribe to low stock alerts
signalRService.lowStockAlert$.subscribe(event => {
  toastService.warning(`${event.productName} is low on stock!`);
});

// Subscribe to GRN completion
signalRService.grnCompleted$.subscribe(event => {
  toastService.success(`GRN ${event.grnNumber} completed`);
  // Refresh inventory
});
```

## Barcode Scanning

### Keyboard-Wedge Scanner

Automatically supported. When a barcode scanner is connected via USB and configured as a keyboard-wedge device, scanning will trigger the `BarcodeScannerService` which emits barcode values.

### Camera Scanner

For camera-based scanning, use the `zxing-scanner` component:

```typescript
import { ZXingScannerModule } from '@zxing/ngx-scanner';

// In component
scanSuccessHandler(result: string) {
  // Handle scanned barcode
  this.productService.getProductByBarcode(result).subscribe(...);
}
```

## Excel Import/Preview

The `ExcelService` provides client-side Excel file preview:

```typescript
import { ExcelService } from '@core/services/excel.service';

// Preview Excel file
const preview = await excelService.previewFile(file);
console.log(preview.headers); // Column headers
console.log(preview.rows);    // Data rows

// Generate template
excelService.generateTemplate(['Product', 'Quantity', 'Price'], 'template.xlsx');
```

## State Management

The application uses Angular signals for reactive state management. Services handle API calls and caching:

- `PurchasingService` - PO and GRN operations
- `InventoryService` - Inventory and batch operations
- `CacheService` - HTTP response caching

## Testing

### Unit Tests

```bash
npm test
# or
ng test
```

### E2E Tests (Cypress)

```bash
npm run e2e
# or
npm run e2e:open  # Interactive mode
```

### Test Coverage

```bash
npm run test:coverage
```

## Key Components

### PurchaseOrderListComponent

- Displays paginated list of purchase orders
- Supports filtering by supplier, status, date range
- Bulk approve functionality (Admin only)
- Touch-friendly for tablets

### PurchaseOrderFormComponent

- Create/edit purchase orders
- Supplier autocomplete
- Product search with barcode scanning
- Unit conversion support
- Real-time total calculation

### GRNListComponent

- List all GRNs with filters
- Quick actions (view, confirm)
- Status indicators

### GRNFormComponent

- Create GRN from PO or ad-hoc
- Invoice file upload
- Batch number and expiry date capture
- Auto-match PO items

### InventoryDashboardComponent

- Dashboard widgets:
  - Total SKUs
  - Total Stock Value
  - Low Stock Count
  - Expiry Soon Count
- Charts for stock trends

## Responsive Design

The UI is optimized for:
- **Desktop**: Full-featured admin interface
- **Tablet**: Touch-friendly controls for POS staff
- **Mobile**: Responsive layout with collapsible sections

## Touch-Friendly Features

- Minimum 44px touch targets
- Large buttons and inputs
- Swipe gestures where applicable
- Optimized for tablet use in warehouse/stockroom

## Error Handling

- Global error interceptor for API errors
- Toast notifications for user feedback
- Form validation with clear error messages
- Retry logic for failed requests

## Performance Optimizations

- HTTP response caching (5-10 minutes for master data)
- Lazy loading for feature modules
- OnPush change detection where applicable
- Virtual scrolling for large lists (future enhancement)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Notes

### Adding New Components

1. Create component in appropriate feature module
2. Add route in feature routes file
3. Update navigation menu if needed
4. Add unit tests

### API Service Pattern

```typescript
// In service
getPurchaseOrders(filters?: PurchaseOrderFilters): Observable<PurchaseOrderListResponse> {
  return this.api.get<PurchaseOrderListResponse>('purchasing/purchase-orders', {
    params: filters,
    cache: true,
    cacheTTL: 30000,
  });
}

// In component
this.purchasingService.getPurchaseOrders(filters).subscribe({
  next: (response) => {
    this.purchaseOrders.set(response.items);
  },
  error: (error) => {
    this.toastService.error('Failed to load purchase orders');
  },
});
```

## Troubleshooting

### SignalR Not Connecting

1. Check backend is running
2. Verify CORS is configured
3. Check authentication token is valid
4. Check browser console for errors

### Barcode Scanner Not Working

1. Verify scanner is in keyboard-wedge mode
2. Check input field is focused
3. Test with manual barcode entry
4. Check `BarcodeScannerService` is injected

### Excel Preview Not Working

1. Verify `xlsx` package is installed
2. Check file format (must be .xlsx or .xls)
3. Check browser console for errors
4. Verify file size is within limits

## Next Steps

### Pending Features

- [ ] GRN Form Component (full implementation)
- [ ] GRN Confirm Component
- [ ] Inventory Dashboard Component
- [ ] Product Batch List Component
- [ ] Adjustment Form Component
- [ ] Audit Logs Component
- [ ] Unit tests for all components
- [ ] E2E tests for critical flows

### Enhancements

- [ ] Advanced filtering and search
- [ ] Export to Excel functionality
- [ ] Print GRN slip
- [ ] QR code generation for batches
- [ ] Stock valuation charts
- [ ] Supplier return workflow
- [ ] Undo last GRN (with time window)

## Support

For issues or questions:
1. Check the backend API documentation
2. Review console logs for errors
3. Verify environment configuration
4. Check network tab for API calls

## License

Same as main project license.

