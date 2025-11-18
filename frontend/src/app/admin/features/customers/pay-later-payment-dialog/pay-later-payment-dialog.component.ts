import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CustomerService } from '@core/services/customer.service';
import { ToastService } from '@core/toast/toast.service';
import { PayLaterBalance } from '@core/models/customer.model';

export interface PayLaterPaymentDialogData {
  customerId: string;
  customerName: string;
  currentBalance: number;
  limit: number;
  availableCredit: number;
}

@Component({
  selector: 'grocery-pay-later-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
  ],
  template: `
    <div class="payment-dialog p-4 max-w-md">
      <h2 mat-dialog-title class="flex items-center gap-2">
        <mat-icon>payment</mat-icon>
        Record Pay Later Payment
      </h2>

      <mat-dialog-content>
        <!-- Customer Info -->
        <mat-card class="mb-4">
          <mat-card-content>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Customer</p>
                <p class="font-semibold">{{ data.customerName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Current Balance</p>
                <p class="font-semibold text-red-600">{{ data.currentBalance | currency: 'INR' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Limit</p>
                <p class="font-semibold">{{ data.limit | currency: 'INR' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Available Credit</p>
                <p class="font-semibold text-green-600">{{ data.availableCredit | currency: 'INR' }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Payment Form -->
        <form [formGroup]="paymentForm" class="space-y-4">
          <mat-form-field class="w-full">
            <mat-label>Payment Amount</mat-label>
            <input
              matInput
              type="number"
              formControlName="amount"
              placeholder="Enter amount"
              min="0.01"
              [max]="data.currentBalance"
              step="0.01"
            />
            <mat-icon matPrefix>currency_rupee</mat-icon>
            <mat-hint>Maximum: {{ data.currentBalance | currency: 'INR' }}</mat-hint>
            @if (paymentForm.get('amount')?.hasError('required')) {
              <mat-error>Amount is required</mat-error>
            }
            @if (paymentForm.get('amount')?.hasError('min')) {
              <mat-error>Amount must be greater than 0</mat-error>
            }
            @if (paymentForm.get('amount')?.hasError('max')) {
              <mat-error>Amount cannot exceed current balance</mat-error>
            }
          </mat-form-field>

          <mat-form-field class="w-full">
            <mat-label>Payment Reference (Optional)</mat-label>
            <input
              matInput
              type="text"
              formControlName="paymentReference"
              placeholder="UPI reference, cheque number, etc."
            />
            <mat-icon matPrefix>receipt</mat-icon>
          </mat-form-field>

          <mat-form-field class="w-full">
            <mat-label>Description (Optional)</mat-label>
            <textarea
              matInput
              formControlName="description"
              rows="3"
              placeholder="Additional notes about this payment"
            ></textarea>
          </mat-form-field>

          <!-- Payment Preview -->
          @if (paymentForm.get('amount')?.value && paymentForm.get('amount')?.valid) {
            <mat-card class="bg-blue-50">
              <mat-card-content>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Payment Amount</p>
                    <p class="font-semibold text-lg">{{ paymentForm.get('amount')?.value | currency: 'INR' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">New Balance</p>
                    <p class="font-semibold text-lg text-green-600">
                      {{ (data.currentBalance - (paymentForm.get('amount')?.value || 0)) | currency: 'INR' }}
                    </p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="flex justify-end gap-2">
        <button mat-button (click)="onCancel()" [disabled]="isProcessing()">
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="onSubmit()"
          [disabled]="!paymentForm.valid || isProcessing()">
          @if (isProcessing()) {
            <mat-spinner diameter="20"></mat-spinner>
            Processing...
          } @else {
            <mat-icon>check</mat-icon>
            Record Payment
          }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .payment-dialog {
      min-width: 500px;
    }
  `]
})
export class PayLaterPaymentDialogComponent {
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private dialogRef = inject(MatDialogRef<PayLaterPaymentDialogComponent>);
  public data = inject<PayLaterPaymentDialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  paymentForm: FormGroup;
  isProcessing = signal(false);
  balance = signal<PayLaterBalance | null>(null);

  constructor() {
    this.paymentForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01), Validators.max(this.data.currentBalance)]],
      paymentReference: [''],
      description: [''],
    });

    // Update max validator when balance changes
    this.paymentForm.get('amount')?.valueChanges.subscribe(() => {
      const amountControl = this.paymentForm.get('amount');
      if (amountControl) {
        amountControl.setValidators([
          Validators.required,
          Validators.min(0.01),
          Validators.max(this.data.currentBalance),
        ]);
        amountControl.updateValueAndValidity();
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.paymentForm.valid) {
      this.toastService.warning('Please fill in all required fields correctly');
      return;
    }

    const amount = this.paymentForm.get('amount')?.value;
    if (amount > this.data.currentBalance) {
      this.toastService.error('Payment amount cannot exceed current balance');
      return;
    }

    this.isProcessing.set(true);

    this.customerService.recordPayLaterPayment(this.data.customerId, {
      amount: amount,
      description: this.paymentForm.get('description')?.value || undefined,
      paymentReference: this.paymentForm.get('paymentReference')?.value || undefined,
    }).subscribe({
      next: (ledgerEntry) => {
        const formattedAmount = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
        this.toastService.success(`Payment of ${formattedAmount} recorded successfully`);
        this.dialogRef.close(ledgerEntry);
      },
      error: (error) => {
        this.toastService.error(
          error?.error?.message || 'Failed to record payment. Please try again.'
        );
        this.isProcessing.set(false);
        console.error('Payment recording failed:', error);
      },
    });
  }
}

