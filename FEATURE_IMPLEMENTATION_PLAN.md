# Feature Implementation Plan

## Overview
This document outlines the implementation plan for the new features requested:
1. Assisted POS (Sales Boy) enhancements
2. Customer Profile System
3. Loyalty Program
4. Pay Later System (Udhar)
5. Offers & Discounts
6. Accounting Module

## Current State Analysis

### ✅ Already Implemented (Backend)
- Customer entity with LoyaltyPoints, PayLaterBalance, PayLaterLimit
- Sale entity with split payment support (Cash, UPI, Card, PayLater)
- Offer entity with various discount types
- LoyaltyTransaction entity
- PayLaterLedger entity
- LedgerEntry entity for accounting

### ⚠️ Needs Enhancement
- Customer profile APIs (purchase history, saved items)
- POS UI enhancements (customer identification, discount override, price override, keyboard shortcuts)
- Offers auto-apply logic at POS
- Accounting module APIs and UI
- Loyalty points calculation and redemption at POS

## Implementation Phases

### Phase 1: Customer Profile System (Foundation)
**Priority: HIGH** - Other features depend on this

#### Backend Tasks:
1. Add CustomerSavedItem entity for frequently purchased items
2. Create APIs:
   - `GET /api/customers/{id}/purchase-history` - Purchase history with pagination
   - `GET /api/customers/{id}/ledger` - Pay later ledger entries
   - `GET /api/customers/{id}/saved-items` - Frequently purchased items
   - `POST /api/customers/{id}/saved-items` - Add to saved items
   - `GET /api/customers/by-phone/{phone}` - Already exists, verify it works
   - `PUT /api/customers/{id}/pay-later-settings` - Enable/disable pay later, set limit

#### Frontend Tasks:
1. Enhance CustomerDetailsComponent to show:
   - Purchase history table
   - Pay later ledger
   - Saved items list
   - Loyalty points history
2. Create CustomerProfileService with methods for all customer operations

### Phase 2: Assisted POS Enhancements
**Priority: HIGH** - Core sales functionality

#### Backend Tasks:
1. Enhance Sale creation API to support:
   - Customer identification by phone or "Guest"
   - Discount override (percentage or amount)
   - Manual price override (with permission check)
   - Split payments (already supported in entity, need API validation)
   - Offer auto-application

#### Frontend Tasks:
1. Enhance POS component:
   - Customer search/identification by phone
   - "Guest" option
   - Discount override input (percentage/amount toggle)
   - Manual price override (with admin permission check)
   - Split payment UI (Cash + UPI, etc.)
   - Keyboard shortcuts:
     - `F1` - Search products
     - `F2` - Customer search
     - `F3` - Apply discount
     - `F4` - Toggle payment method
     - `F5` - Complete sale
     - `Esc` - Cancel/Close
   - Show customer info (loyalty points, pay later balance) at checkout

2. Enhance CheckoutModalComponent:
   - Split payment inputs
   - Customer info display
   - Loyalty points redemption
   - Pay later option (if enabled)
   - Offer/coupon code input
   - Discount override

### Phase 3: Loyalty Program
**Priority: MEDIUM**

#### Backend Tasks:
1. Create LoyaltyService:
   - Calculate points: ₹100 spent = 1 point
   - Redeem points at POS (1 point = ₹1 discount)
   - Get available points for customer
2. Enhance Sale creation to:
   - Calculate and award loyalty points
   - Handle point redemption
   - Create LoyaltyTransaction entries

#### Frontend Tasks:
1. Display loyalty points at checkout
2. Add loyalty points redemption input
3. Show points earned after sale completion

### Phase 4: Pay Later System (Udhar)
**Priority: MEDIUM**

#### Backend Tasks:
1. Create PayLaterService:
   - Validate pay later eligibility
   - Check limit before allowing pay later
   - Create ledger entries
   - Payment receipt generation
2. Create APIs:
   - `POST /api/customers/{id}/pay-later-payment` - Record payment
   - `GET /api/customers/{id}/pay-later-balance` - Get current balance
   - `GET /api/customers/{id}/pay-later-ledger` - Get ledger entries

#### Frontend Tasks:
1. Add pay later option in checkout (if enabled for customer)
2. Show pay later balance and limit
3. Create payment receipt UI
4. Add notification system for outstanding balances

### Phase 5: Offers & Discounts
**Priority: MEDIUM**

#### Backend Tasks:
1. Create OfferService:
   - Auto-apply valid offers at POS
   - Validate coupon codes
   - Calculate discount based on offer type
   - Support: BOGO, percentage, flat, quantity-based, festival, coupon codes
2. Create APIs:
   - `GET /api/offers/active` - Get active offers
   - `POST /api/offers/validate-coupon` - Validate coupon code
   - `GET /api/offers/for-cart` - Get applicable offers for cart items

#### Frontend Tasks:
1. Auto-apply offers at POS
2. Coupon code input in checkout
3. Show applied offers in cart
4. Offer management UI (admin)

### Phase 6: Accounting Module
**Priority: LOW** (Can be done after core features)

#### Backend Tasks:
1. Create AccountingService:
   - Purchase ledger entries (from Purchase Orders)
   - Sales ledger entries (from Sales)
   - Pay later ledger entries
   - GST calculations
   - Daily closing summary
2. Create APIs:
   - `GET /api/accounting/purchase-ledger` - Purchase ledger
   - `GET /api/accounting/sales-ledger` - Sales ledger
   - `GET /api/accounting/pay-later-ledger` - Pay later ledger
   - `GET /api/accounting/daily-summary` - Daily closing summary
   - `GET /api/accounting/gst-summary` - GST calculations

#### Frontend Tasks:
1. Create AccountingDashboardComponent
2. Ledger views (purchase, sales, pay later)
3. Daily closing summary UI
4. GST report UI
5. Payment receipt generation

## Implementation Order

1. **Phase 1** - Customer Profile System (Foundation)
2. **Phase 2** - Assisted POS Enhancements (Core functionality)
3. **Phase 3** - Loyalty Program (Enhances POS)
4. **Phase 4** - Pay Later System (Enhances POS)
5. **Phase 5** - Offers & Discounts (Enhances POS)
6. **Phase 6** - Accounting Module (Reporting)

## Notes

- All features should maintain backward compatibility
- Use existing domain entities where possible
- Follow Clean Architecture principles
- Implement proper error handling and validation
- Add unit tests for critical business logic
- Use SignalR for real-time updates where applicable

