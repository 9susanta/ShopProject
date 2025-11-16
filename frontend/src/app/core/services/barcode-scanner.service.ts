import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BarcodeScannerService {
  private barcodeSubject = new Subject<string>();
  private currentBarcode = '';
  private timeoutId?: number;

  constructor() {
    // Listen for keyboard input (keyboard-wedge scanners)
    if (typeof window !== 'undefined') {
      window.addEventListener('keypress', this.handleKeyPress.bind(this));
    }
  }

  private handleKeyPress(event: KeyboardEvent): void {
    // Clear timeout if user is typing
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (event.key === 'Enter') {
      // Barcode complete
      if (this.currentBarcode.length > 0) {
        this.barcodeSubject.next(this.currentBarcode);
        this.currentBarcode = '';
      }
    } else {
      // Accumulate characters
      this.currentBarcode += event.key;
      
      // Set timeout to reset if no activity (for manual typing)
      this.timeoutId = window.setTimeout(() => {
        this.currentBarcode = '';
      }, 100);
    }
  }

  onBarcodeScanned(): Observable<string> {
    return this.barcodeSubject.asObservable().pipe(
      debounceTime(100)
    );
  }

  scanBarcode(barcode: string): void {
    this.barcodeSubject.next(barcode);
  }
}

