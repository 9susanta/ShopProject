import { Component, output, viewChild, signal, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BarcodeScannerService } from '../../../../core/services/barcode-scanner.service';

@Component({
  selector: 'grocery-barcode-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './barcode-input.component.html',
  styleUrls: ['./barcode-input.component.css'],
})
export class BarcodeInputComponent implements OnInit, OnDestroy {
  // Using viewChild signal (Angular 20 feature)
  barcodeInput = viewChild<ElementRef<HTMLInputElement>>('barcodeInput');
  
  // Signal for barcode value
  barcode = signal('');
  
  // Signal-based output
  barcodeScanned = output<string>();

  private barcodeScannerService = inject(BarcodeScannerService);
  private scannerSubscription?: Subscription;

  ngOnInit(): void {
    // Subscribe to keyboard-wedge scanner events
    this.scannerSubscription = this.barcodeScannerService.onBarcodeScanned().subscribe(
      (scannedBarcode: string) => {
        if (scannedBarcode && scannedBarcode.trim().length > 0) {
          this.barcode.set(scannedBarcode);
          this.barcodeScanned.emit(scannedBarcode.trim());
          this.barcode.set('');
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.scannerSubscription) {
      this.scannerSubscription.unsubscribe();
    }
  }

  onBarcodeEntered(): void {
    const barcodeValue = this.barcode().trim();
    if (barcodeValue) {
      this.barcodeScanned.emit(barcodeValue);
      this.barcode.set('');
    }
  }

  focus(): void {
    const input = this.barcodeInput();
    if (input) {
      input.nativeElement.focus();
    }
  }

  clear(): void {
    this.barcode.set('');
  }
}
