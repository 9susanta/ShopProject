/**
 * Keyboard shortcuts for POS component
 * F1 - Search products
 * F2 - Customer search
 * F3 - Apply discount
 * F4 - Toggle payment method
 * F5 - Complete sale
 * Esc - Cancel/Close
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class POSKeyboardShortcuts {
  private shortcuts: Map<string, () => void> = new Map();

  register(key: string, handler: () => void): void {
    this.shortcuts.set(key, handler);
  }

  unregister(key: string): void {
    this.shortcuts.delete(key);
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    const key = event.key;
    const handler = this.shortcuts.get(key);
    
    if (handler) {
      event.preventDefault();
      event.stopPropagation();
      handler();
      return true;
    }
    
    return false;
  }

  // Helper to get function key name
  static getFunctionKeyName(key: string): string {
    const keyMap: Record<string, string> = {
      'F1': 'Search Products',
      'F2': 'Customer Search',
      'F3': 'Apply Discount',
      'F4': 'Toggle Payment',
      'F5': 'Complete Sale',
      'Escape': 'Cancel/Close'
    };
    return keyMap[key] || key;
  }
}

