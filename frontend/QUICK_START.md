# Quick Start Guide

## Installation

```bash
cd frontend
npm install
```

## Development Server

```bash
npm start
# Application will be available at http://localhost:4200
```

## Environment Setup

1. Copy `src/environments/environment.ts` and update API URLs:
   ```typescript
   apiUrl: 'http://localhost:5000/api',
   signalRHub: 'http://localhost:5000/hubs/imports',
   ```

## Key Features Available

### ✅ Fully Functional
- **Login/Authentication** - `/login`
- **Admin Dashboard** - `/admin/dashboard`
- **Product Management** - `/admin/products`
  - List products with ag-Grid
  - Create/Edit products
  - Barcode scanning support
- **Bulk Import** - `/admin/imports`
  - Complete workflow: Upload → Mapping → Preview → Options → Processing
  - Real-time progress via SignalR
  - Error report download
- **POS Kiosk** - `/pos/kiosk`
  - Product tiles with images
  - Category navigation
  - Search with typeahead
  - Shopping cart
  - Checkout flow
  - Voice commands

### ⏳ Stubs (Need Implementation)
- Inventory Management
- Reports (Daily Sales, GST Summary, Fast Moving)
- Settings
- Assisted POS

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run e2e:open
```

## Building for Production

```bash
npm run build
# Output in dist/grocery-store/
```

## Important Notes

1. **Backend Required**: The app expects a .NET 8 backend running on `http://localhost:5000`
2. **SignalR**: Ensure SignalR hub is configured for real-time updates
3. **File Upload**: Import feature supports .xlsx and .json files (max 50MB)
4. **Barcode Scanner**: Supports keyboard-wedge scanners and camera scanning (zxing)

## Troubleshooting

- **SignalR not connecting**: Check `signalRHub` URL in environment
- **Import preview not loading**: Verify file format and size
- **Products not loading**: Check API endpoint `/api/products`
- **Login issues**: Verify JWT token handling in auth service

