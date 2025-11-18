# SignalR Connection Error Fix

## Issue
SignalR was trying to connect on app initialization (before login), causing console errors:
- `POST http://localhost:5000/hubs/import-progress/negotiate net::ERR_CONNECTION_REFUSED`
- `POST http://localhost:5000/hubs/inventory/negotiate net::ERR_CONNECTION_REFUSED`

## Root Causes

1. **SignalR starting before authentication**: SignalR was starting in `app.component.ts` ngOnInit regardless of auth state
2. **No error suppression**: Connection errors were being logged to console
3. **No automatic retry configuration**: SignalR wasn't configured with proper retry logic

## Fixes Applied

### 1. App Component (`app.component.ts`)
- Only start SignalR if user is already authenticated
- Subscribe to `authService.currentUser$` to start SignalR after successful login
- Stop SignalR on logout
- Silently handle connection errors (no console logging)

### 2. SignalR Service (`signalr.service.ts`)
- Added automatic reconnect with exponential backoff (2s, 5s, 10s, 30s max)
- Made error handling completely silent for connection refused errors
- Only log non-connection errors in development mode
- Wrapped hub start calls in try-catch to prevent errors from bubbling up

### 3. Error Handling
- Connection refused errors are now silently handled
- SignalR will automatically retry when backend becomes available
- No console errors shown to users

## Behavior After Fix

1. **Before Login**: SignalR does NOT attempt to connect
2. **After Login**: SignalR automatically starts and connects
3. **On Logout**: SignalR stops all connections
4. **Backend Not Available**: SignalR silently retries with exponential backoff
5. **No Console Errors**: Connection errors are suppressed

## Files Modified

1. `frontend/src/app/app.component.ts` - Conditional SignalR start based on auth state
2. `frontend/src/app/core/services/signalr.service.ts` - Silent error handling and auto-reconnect

## Testing

After rebuild, test:
1. Open login page - should see NO SignalR connection errors
2. Login successfully - SignalR should connect automatically
3. Logout - SignalR should disconnect
4. With API stopped - should see NO console errors

