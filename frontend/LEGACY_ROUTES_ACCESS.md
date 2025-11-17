# Legacy Routes - Access Instructions

## ✅ Routes Fixed and Moved to Top

The legacy routes have been moved to the **top of the route list** (right after login) to ensure they're matched before other routes.

## 🔗 Direct Access URLs

Try accessing these URLs directly in your browser:

1. **Legacy POS:**
   ```
   http://localhost:4200/pos-legacy
   ```

2. **Legacy Import:**
   ```
   http://localhost:4200/admin-imports-legacy
   ```

3. **Legacy Login:**
   ```
   http://localhost:4200/login-legacy
   ```

## ⚠️ If Routes Still Redirect to Dashboard

If you're still being redirected to the dashboard, it might be because:

### 1. **Browser Cache**
   - Clear your browser cache
   - Or use an incognito/private window
   - Or hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### 2. **App Initialization Redirect**
   - The app might be redirecting on load
   - Try navigating directly to the URL after the app loads
   - Or use the browser's back button after navigating

### 3. **Route Guards**
   - `admin-imports-legacy` doesn't have guards (should be accessible)
   - `pos-legacy` doesn't have guards (should be accessible)
   - `login-legacy` doesn't have guards (should be accessible)

### 4. **Check Browser Console**
   - Open Developer Tools (F12)
   - Check the Console tab for any errors
   - Check the Network tab to see if routes are being called

## 🔍 Debugging Steps

1. **Check if routes are registered:**
   - Open browser DevTools
   - Go to Console
   - Type: `ng.probe(document.body).injector.get(ng.router.Router).config`
   - This will show all registered routes

2. **Check current route:**
   - In Console, type: `ng.probe(document.body).injector.get(ng.router.Router).url`
   - This shows the current route

3. **Navigate programmatically:**
   - In Console, type:
   ```javascript
   ng.probe(document.body).injector.get(ng.router.Router).navigate(['/pos-legacy'])
   ```

## 📝 Route Order (Current)

Routes are now ordered as:
1. `''` (empty - redirects to dashboard)
2. `'login'`
3. `'pos-legacy'` ⬅️ **Legacy routes here**
4. `'admin-imports-legacy'` ⬅️
5. `'login-legacy'` ⬅️
6. `'admin'` (with AdminGuard)
7. `'pos'` (new POS)
8. ... other routes ...
9. `'**'` (wildcard - redirects to dashboard)

## ✅ Expected Behavior

- **`/pos-legacy`** → Should load `PosComponent` directly (no layout wrapper)
- **`/admin-imports-legacy`** → Should load `ImportUploadComponent` directly (no layout wrapper)
- **`/login-legacy`** → Should load legacy `LoginComponent` directly

All legacy routes load **standalone** (no parent layout), so they should appear as full-page components.

