# Additional Missing Features Identified

## Critical Missing Features

### 1. ❌ Accounting Module Frontend
**Status:** MISSING
- Backend API exists: `GET /api/accounting/daily-closing`
- No frontend component exists
- No service exists
- No routes configured

**Required:**
- `AccountingService` in frontend
- `DailyClosingComponent` 
- Route: `/admin/accounting` or `/admin/accounting/daily-closing`
- Link in admin navigation

---

### 2. ❌ Pay Later Payment UI
**Status:** MISSING
- Backend API exists: `POST /api/customers/{id}/pay-later-payment`
- Frontend service method exists: `recordPayLaterPayment()`
- No UI component to record payments
- Should be accessible from customer details page

**Required:**
- Payment dialog/modal component
- Button in customer details page (Pay Later Ledger tab)
- Form to enter payment amount, description, reference

---

### 3. ❌ Pay Later Balance API Endpoint
**Status:** MISSING
- Plan mentions: `GET /api/customers/{id}/pay-later-balance`
- Not implemented
- Balance is included in customer DTO, but dedicated endpoint might be useful

**Required:**
- Endpoint: `GET /api/customers/{id}/pay-later-balance`
- Returns: `{ balance: number, limit: number, isEnabled: boolean }`

---

### 4. ❌ Loyalty Points Earned Display
**Status:** MISSING
- Points are calculated and awarded in backend
- No UI to show points earned after sale completion
- Should display in sale completion message or receipt

**Required:**
- Display points earned in checkout success message
- Show in sale details/receipt

---

### 5. ❌ Applied Offers Display
**Status:** MISSING
- Offers are applied in backend
- No UI to show which offers were applied
- Should show in cart/checkout

**Required:**
- Display applied offers in checkout modal
- Show discount breakdown
- Show coupon code if used

---

### 6. ❌ Offer Management UI (Admin)
**Status:** MISSING
- Offer entity exists in backend
- No admin UI to create/edit/delete offers
- No routes configured

**Required:**
- Offer list component
- Offer form component (create/edit)
- Routes: `/admin/offers`
- CRUD operations

---

### 7. ❌ Payment Receipt Generation
**Status:** MISSING
- Plan mentions payment receipt generation
- No implementation exists
- Should generate PDF/printable receipt for pay later payments

**Required:**
- Receipt generation service
- Print/download functionality
- Receipt template

---

### 8. ❌ Notification System for Pay Later
**Status:** MISSING
- Plan mentions notifications for outstanding balances
- No implementation exists
- Should notify when balance exceeds threshold

**Required:**
- Notification service enhancement
- Threshold configuration
- Alert system

---

## Medium Priority Missing Features

### 9. ⚠️ Points Earned After Sale
**Status:** PARTIALLY MISSING
- Backend calculates and awards points
- No UI feedback to user
- Should show in sale completion

---

### 10. ⚠️ Offer Validation API
**Status:** MISSING
- Plan mentions: `POST /api/offers/validate-coupon`
- Not implemented
- Should validate coupon code before applying

**Required:**
- Endpoint: `POST /api/offers/validate-coupon`
- Returns: `{ isValid: boolean, offer: OfferDto, discount: number }`

---

### 11. ⚠️ Get Applicable Offers API
**Status:** MISSING
- Plan mentions: `GET /api/offers/for-cart`
- Not implemented
- Should return offers applicable to cart items

**Required:**
- Endpoint: `GET /api/offers/for-cart?productIds=...`
- Returns: List of applicable offers

---

## Low Priority / Optional

### 12. ⚠️ Enhanced Keyboard Shortcuts
- Basic shortcuts implemented
- Could add more (Ctrl+S, etc.)
- Could add visual help overlay

### 13. ⚠️ Database Migration
- CustomerSavedItem needs migration
- Should be run before deployment

---

## Summary

**Critical (Must Have):**
1. Accounting Module Frontend
2. Pay Later Payment UI
3. Pay Later Balance API
4. Loyalty Points Display
5. Applied Offers Display

**Medium Priority:**
6. Offer Management UI
7. Offer Validation API
8. Get Applicable Offers API

**Low Priority:**
9. Payment Receipt Generation
10. Notification System
11. Enhanced Keyboard Shortcuts

