import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'warn' | 'accent';
}

@Component({
  selector: 'grocery-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {
  title = signal('');
  message = signal('');
  confirmText = signal('Confirm');
  cancelText = signal('Cancel');
  confirmColor = signal<'primary' | 'warn' | 'accent'>('primary');

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    this.title.set(data.title);
    this.message.set(data.message);
    if (data.confirmText) this.confirmText.set(data.confirmText);
    if (data.cancelText) this.cancelText.set(data.cancelText);
    if (data.confirmColor) this.confirmColor.set(data.confirmColor);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

