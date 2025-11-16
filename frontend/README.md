# Grocery Store Management System - Angular Frontend

A production-ready Angular 20 web application for managing a grocery store, featuring Point of Sale (POS), Admin Dashboard, and Product Import functionality.

## Features

- **Point of Sale (POS)**: Tile-based product grid, shopping cart, barcode scanning, voice commands, and checkout
- **Admin Dashboard**: KPIs, recent imports, low stock alerts
- **Product Import**: Excel/JSON file upload with column mapping and progress tracking
- **Authentication**: JWT-based auth with refresh token flow (Admin/Staff and Customer OTP)
- **Caching**: Memory + localStorage caching with TTL
- **SignalR**: Real-time import progress updates
- **Responsive UI**: Modern design with Tailwind CSS and Angular Material
- **Accessibility**: Keyboard navigation, ARIA attributes, large touch targets

## Prerequisites

- Node.js 20+ and npm
- Angular CLI 20+
- Backend API running at `http://localhost:5000/api` (configurable via environment files)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment (optional):
   - Edit `src/environments/environment.ts` for development
   - Edit `src/environments/environment.prod.ts` for production

## Development

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:4200`

## Building for Production

Build the application:
```bash
npm run build
```

The production build will be in `dist/grocery-store-ui/`

## Testing

Run unit tests:
```bash
npm test
```

## Linting and Formatting

Lint the code:
```bash
npm run lint
```

Format the code:
```bash
npm run format
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/           # Core services, guards, interceptors, models
│   │   ├── shared/          # Shared components and modules
│   │   ├── admin/           # Admin module (dashboard, imports)
│   │   ├── pos/             # POS module
│   │   └── app.module.ts    # Root module
│   ├── environments/        # Environment configuration
│   └── main.ts              # Application entry point
├── angular.json             # Angular CLI configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

## Key Backend Endpoints

The application expects the following backend endpoints:

### Authentication
- `POST /api/auth/login` - Admin/Staff login
- `POST /api/auth/otp` - Request OTP for customer
- `POST /api/auth/otp/verify` - Verify OTP
- `POST /api/auth/refresh` - Refresh access token

### Products
- `GET /api/products?paged=false` - Get all products
- `GET /api/products?search={term}` - Search products
- `GET /api/products/barcode/{barcode}` - Get product by barcode

### Categories
- `GET /api/categories` - Get all categories

### Sales
- `POST /api/sales` - Create sale

### Admin
- `GET /api/admin/dashboard` - Get dashboard KPIs
- `POST /api/admin/imports/upload` - Upload import file
- `POST /api/admin/imports/{jobId}/start` - Start import job
- `GET /api/admin/imports/{jobId}/status` - Get import status

### SignalR
- Hub URL: `http://localhost:5000/hubs/import`
- Event: `ImportProgressUpdated`

## Environment Variables

Configure in `src/environments/environment.ts`:

- `apiUrl`: Backend API base URL
- `signalRHub`: SignalR hub URL
- `enableSignalR`: Enable/disable SignalR
- `cacheTTL`: Cache time-to-live in milliseconds

## Security Notes

- Access tokens are stored in memory (not localStorage) for better security
- Refresh tokens are stored in localStorage (consider secure storage in production)
- In production, consider using httpOnly cookies for tokens
- Implement proper CORS configuration on the backend

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### SignalR Connection Issues
- Ensure the backend SignalR hub is running
- Check CORS configuration
- Verify `signalRHub` URL in environment files

### CORS Errors
- Configure CORS on the backend to allow requests from `http://localhost:4200`

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Angular cache: `ng cache clean`

## License

Proprietary - All rights reserved


