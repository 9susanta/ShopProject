import { Component, output, viewChild, signal, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BarcodeScannerService } from '../../../../core/services/barcode-scanner.service';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { BarcodeCameraComponent } from '../barcode-camera/barcode-camera.component';

@Component({
  selector: 'grocery-barcode-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatTooltipModule, MatDialogModule],
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
  private dialog = inject(MatDialog);
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

  openCameraScanner(): void {
    const dialogRef = this.dialog.open(BarcodeCameraComponent, {
      width: '90vw',
      maxWidth: '640px',
      disableClose: false,
      panelClass: 'barcode-camera-dialog',
    });

    dialogRef.componentInstance.barcodeScanned.subscribe((barcode: string) => {
      if (barcode) {
        this.barcodeScanned.emit(barcode);
        dialogRef.close();
      }
    });

    dialogRef.componentInstance.closeDialog.subscribe(() => {
      dialogRef.close();
    });
  }
}
