# Grocery Store Management System - Frontend

Production-ready Angular 20 application for managing a grocery store with Admin, POS, and Customer Touchscreen interfaces.

## Tech Stack

- **Angular 20** (Strict Mode)
- **TypeScript 5.4**
- **RxJS** for reactive programming
- **NgRx** for state management (optional, used for complex features)
- **Angular Material** for UI components
- **ag-Grid** for data tables
- **Chart.js** (ng2-charts) for dashboard widgets
- **SignalR** for real-time updates
- **SheetJS (xlsx)** for Excel parsing
- **zxing-ngx-scanner** for barcode scanning
- **jsbarcode** for barcode generation
- **ngx-translate** for localization (English, Hindi)

## Prerequisites

- Node.js 18+ and npm 9+
- Angular CLI 20
- Backend API running (or use mock server)

## Installation

```bash
# Install dependencies
npm install

# If using mock server, install in-memory-web-api
npm install --save-dev angular-in-memory-web-api
```

## Development

```bash
# Start development server
npm start

# Application will be available at http://localhost:4200
```

## Environment Configuration

Create environment files in `src/environments/`:

### `environment.ts` (default)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  signalRHub: 'http://localhost:5000/hubs/imports',
  enableSignalR: true,
  enableMockServer: false,
  enablePWA: false
};
```

### `environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',
  signalRHub: 'https://api.yourdomain.com/hubs/imports',
  enableSignalR: true,
  enableMockServer: false,
  enablePWA: true
};
```

## Project Structure

```
src/
├── app/
│   ├── core/              # Core services, guards, interceptors
│   │   ├── auth/          # Authentication & authorization
│   │   ├── api/           # HTTP client wrapper
│   │   ├── signalr/       # SignalR hub service
│   │   ├── models/        # Shared interfaces/models
│   │   └── settings/      # Environment config
│   ├── shared/            # Shared components & utilities
│   │   ├── ui/           # Common UI components
│   │   ├── form-controls/ # Reusable form controls
│   │   └── validators/   # Custom validators
│   └── features/         # Feature modules
│       ├── admin/        # Admin dashboard & management
│       ├── pos/          # Point of Sale (Kiosk & Assisted)
│       ├── inventory/    # Inventory management
│       ├── reports/      # Reports & analytics
│       └── settings/     # Application settings
├── assets/               # Static assets
├── environments/         # Environment configs
└── styles.css           # Global styles
```

## Key Features

### 1. Authentication
- JWT-based authentication for Admin/Staff
- OTP-based phone login for Customers
- Role-based access control (SuperAdmin, Admin, Staff, Customer)
- Token refresh mechanism
- Secure token storage

### 2. Admin Dashboard
- Sales overview widgets with charts
- Inventory summary (low stock, expiry alerts)
- Recent imports list
- Fast-moving products table
- Real-time updates via SignalR

### 3. Bulk Import
- Drag & drop file upload (.xlsx, .json)
- Client-side preview (first 50 rows)
- Column mapping UI
- Import options (createMissingCategories, updateBy, etc.)
- Real-time progress via SignalR
- Error report download (CSV)
- Retry failed rows

### 4. Product Management
- Product list with filters and pagination
- Create/Edit product form
- Barcode scanning (camera + keyboard-wedge)
- Quick create from barcode scan
- Image upload
- Bulk actions

### 5. POS (Point of Sale)
- **Kiosk Mode**: Customer touchscreen interface
  - Large product tiles
  - Category navigation
  - Search with typeahead
  - Voice commands
  - Cart management
  - Checkout flow
- **Assisted Mode**: Sales staff interface
  - Keyboard shortcuts
  - Barcode input
  - Quick discounts
  - Packing screen

### 6. Inventory Management
- Inventory list with filters
- Manual adjustments with audit trail
- Expiry management
- Bulk actions

### 7. Reports
- Daily sales report
- GST summary
- Fast-moving products
- Low stock alerts
- Export to Excel/PDF

## Running Tests

```bash
# Unit tests (Jest)
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests (Cypress)
npm run e2e

# E2E interactive
npm run e2e:open
```

## Building for Production

```bash
# Build
npm run build

# Output will be in dist/grocery-store/
```

## Mock Server (Development)

If backend is not ready, enable mock server:

1. Set `enableMockServer: true` in `environment.ts`
2. Mock data is provided in `src/app/core/mock-data/`
3. API calls will be intercepted by InMemoryWebApi

## PWA Support

To enable PWA:

1. Set `enablePWA: true` in environment
2. Service worker will be registered automatically
3. Offline mode available for POS

## Localization

- Default: English
- Supported: Hindi (optional: Odia)
- Translation files in `src/assets/i18n/`
- Use `translate` pipe or `TranslateService` in components

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- High contrast mode
- Screen reader friendly

## Security

- JWT tokens stored securely
- XSS protection (Angular sanitization)
- CSRF protection
- Input validation
- Secure HTTP (HTTPS in production)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### SignalR Connection Issues
- Check `signalRHub` URL in environment
- Verify CORS settings on backend
- Check browser console for errors

### Barcode Scanner Not Working
- Ensure camera permissions granted
- Check browser compatibility (HTTPS required for camera)
- For keyboard-wedge scanners, ensure focus is on input field

### Import Preview Not Loading
- Check file size (max 50MB)
- Verify file format (.xlsx or .json)
- Check browser console for errors

## Contributing

1. Follow Angular Style Guide
2. Write unit tests for new features
3. Update documentation
4. Follow Git commit conventions

## License

Proprietary - All rights reserved
