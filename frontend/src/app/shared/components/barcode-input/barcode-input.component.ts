import { Component, output, viewChild, signal, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'grocery-barcode-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './barcode-input.component.html',
  styleUrls: ['./barcode-input.component.css'],
})
export class BarcodeInputComponent {
  // Using viewChild signal (Angular 20 feature)
  barcodeInput = viewChild<ElementRef<HTMLInputElement>>('barcodeInput');
  
  // Signal for barcode value
  barcode = signal('');
  
  // Signal-based output
  barcodeScanned = output<string>();

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
