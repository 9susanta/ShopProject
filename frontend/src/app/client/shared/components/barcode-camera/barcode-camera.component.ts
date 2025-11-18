import { Component, output, signal, OnInit, OnDestroy, inject, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'grocery-barcode-camera',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="barcode-camera-container">
      <div class="camera-header">
        <h3>Scan Barcode</h3>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="camera-content">
        @if (isScanning()) {
          <div class="camera-wrapper">
            <video #videoElement class="camera-video" [class.hidden]="!hasPermission()"></video>
            <canvas #canvasElement class="camera-canvas hidden"></canvas>
            @if (!hasPermission()) {
              <div class="permission-message">
                <mat-icon>camera_alt</mat-icon>
                <p>Camera permission required</p>
                <button mat-raised-button color="primary" (click)="requestCameraPermission()">
                  Enable Camera
                </button>
              </div>
            }
            @if (error()) {
              <div class="error-message">
                <mat-icon>error</mat-icon>
                <p>{{ error() }}</p>
              </div>
            }
            <div class="scan-line" [class.active]="isScanning()"></div>
          </div>
        } @else {
          <div class="loading-state">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Initializing camera...</p>
          </div>
        }
      </div>

      <div class="camera-footer">
        <button mat-button (click)="close()">Cancel</button>
        @if (isScanning()) {
          <button mat-raised-button color="primary" (click)="stopScanning()">
            <mat-icon>stop</mat-icon>
            Stop Scanning
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .barcode-camera-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 640px;
      max-height: 90vh;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    .camera-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .camera-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .camera-content {
      position: relative;
      width: 100%;
      min-height: 400px;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .camera-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 400px;
    }

    .camera-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .camera-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .hidden {
      display: none;
    }

    .scan-line {
      position: absolute;
      top: 50%;
      left: 10%;
      right: 10%;
      height: 2px;
      background: #4caf50;
      box-shadow: 0 0 10px #4caf50;
      transform: translateY(-50%);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .scan-line.active {
      opacity: 1;
      animation: scan 2s linear infinite;
    }

    @keyframes scan {
      0%, 100% { transform: translateY(-50%) translateY(-100px); }
      50% { transform: translateY(-50%) translateY(100px); }
    }

    .permission-message,
    .error-message,
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 40px;
      color: white;
      text-align: center;
    }

    .permission-message mat-icon,
    .error-message mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .error-message {
      color: #f44336;
    }

    .camera-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px;
      border-top: 1px solid #e0e0e0;
    }
  `],
})
export class BarcodeCameraComponent implements OnInit, OnDestroy {
  videoElement = viewChild<ElementRef<HTMLVideoElement>>('videoElement');
  canvasElement = viewChild<ElementRef<HTMLCanvasElement>>('canvasElement');

  barcodeScanned = output<string>();
  closeDialog = output<void>();

  isScanning = signal(false);
  hasPermission = signal(false);
  error = signal<string | null>(null);

  private codeReader: BrowserMultiFormatReader | null = null;
  private scanInterval: any = null;

  ngOnInit(): void {
    this.startScanning();
  }

  ngOnDestroy(): void {
    this.stopScanning();
  }

  async startScanning(): Promise<void> {
    try {
      this.codeReader = new BrowserMultiFormatReader();
      this.isScanning.set(true);
      this.error.set(null);

      const video = this.videoElement()?.nativeElement;
      if (!video) {
        throw new Error('Video element not found');
      }

      // Get available video devices
      const videoInputDevices = await this.codeReader.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Use the first available camera (usually the default)
      const deviceId = videoInputDevices[0].deviceId;

      // Start decoding from video stream
      this.codeReader.decodeFromVideoDevice(deviceId, video, (result, err) => {
        if (result) {
          const barcode = result.getText();
          if (barcode) {
            this.barcodeScanned.emit(barcode);
            this.stopScanning();
            this.close();
          }
        }
        if (err && !(err instanceof NotFoundException)) {
          // NotFoundException is expected when no barcode is found
          console.warn('Barcode scan error:', err);
        }
      });

      // Check if we have permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.hasPermission.set(true);
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      } catch (permissionError) {
        this.hasPermission.set(false);
        this.error.set('Camera permission denied. Please enable camera access.');
      }
    } catch (error: any) {
      console.error('Error starting camera scan:', error);
      this.error.set(error.message || 'Failed to start camera');
      this.isScanning.set(false);
    }
  }

  async requestCameraPermission(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.hasPermission.set(true);
      this.error.set(null);
      stream.getTracks().forEach(track => track.stop());
      // Restart scanning with permission
      this.stopScanning();
      await this.startScanning();
    } catch (error: any) {
      this.error.set('Failed to get camera permission: ' + error.message);
    }
  }

  stopScanning(): void {
    if (this.codeReader) {
      this.codeReader.reset();
      this.codeReader = null;
    }
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    this.isScanning.set(false);
  }

  close(): void {
    this.stopScanning();
    this.closeDialog.emit();
  }
}

