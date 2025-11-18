import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GSTExportService } from '@core/services/gst-export.service';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'grocery-gst-export',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="gst-export-container p-4 max-w-4xl mx-auto">
      <mat-card>
        <mat-card-header>
          <mat-card-title>GST Export</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="exportForm" class="mt-4">
            <div class="grid grid-cols-2 gap-4">
              <mat-form-field>
                <mat-label>From Date</mat-label>
                <input matInput [matDatepicker]="fromPicker" formControlName="fromDate">
                <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
                <mat-datepicker #fromPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field>
                <mat-label>To Date</mat-label>
                <input matInput [matDatepicker]="toPicker" formControlName="toDate">
                <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
                <mat-datepicker #toPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="mt-6 flex gap-4">
              <button 
                mat-raised-button 
                color="primary" 
                (click)="exportGSTR1()"
                [disabled]="exporting() || exportForm.invalid"
              >
                @if (exporting() && exportType() === 'GSTR1') {
                  <mat-icon class="animate-spin">hourglass_empty</mat-icon>
                  Exporting...
                } @else {
                  <mat-icon>download</mat-icon>
                  Export GSTR-1
                }
              </button>

              <button 
                mat-raised-button 
                color="accent" 
                (click)="exportGSTR2()"
                [disabled]="exporting() || exportForm.invalid"
              >
                @if (exporting() && exportType() === 'GSTR2') {
                  <mat-icon class="animate-spin">hourglass_empty</mat-icon>
                  Exporting...
                } @else {
                  <mat-icon>download</mat-icon>
                  Export GSTR-2
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .gst-export-container {
      min-height: calc(100vh - 64px);
    }
  `]
})
export class GSTExportComponent {
  private fb = inject(FormBuilder);
  private gstExportService = inject(GSTExportService);
  private toastService = inject(ToastService);

  exportForm!: FormGroup;
  exporting = signal(false);
  exportType = signal<'GSTR1' | 'GSTR2' | null>(null);

  constructor() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.exportForm = this.fb.group({
      fromDate: [firstDayOfMonth, Validators.required],
      toDate: [today, Validators.required],
    });
  }

  exportGSTR1(): void {
    if (this.exportForm.invalid) return;

    this.exporting.set(true);
    this.exportType.set('GSTR1');
    const { fromDate, toDate } = this.exportForm.value;

    this.gstExportService.exportGSTR1(
      fromDate.toISOString(),
      toDate.toISOString()
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GSTR1_${fromDate.toISOString().split('T')[0]}_${toDate.toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('GSTR-1 exported successfully');
        this.exporting.set(false);
        this.exportType.set(null);
      },
      error: (error) => {
        console.error('Error exporting GSTR-1:', error);
        this.toastService.error('Failed to export GSTR-1');
        this.exporting.set(false);
        this.exportType.set(null);
      },
    });
  }

  exportGSTR2(): void {
    if (this.exportForm.invalid) return;

    this.exporting.set(true);
    this.exportType.set('GSTR2');
    const { fromDate, toDate } = this.exportForm.value;

    this.gstExportService.exportGSTR2(
      fromDate.toISOString(),
      toDate.toISOString()
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GSTR2_${fromDate.toISOString().split('T')[0]}_${toDate.toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('GSTR-2 exported successfully');
        this.exporting.set(false);
        this.exportType.set(null);
      },
      error: (error) => {
        console.error('Error exporting GSTR-2:', error);
        this.toastService.error('Failed to export GSTR-2');
        this.exporting.set(false);
        this.exportType.set(null);
      },
    });
  }
}

