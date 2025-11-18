import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { SupplierPaymentService } from '@core/services/supplier-payment.service';
import { PurchasingService } from '@core/services/purchasing.service';
import { ToastService } from '@core/toast/toast.service';
import { SupplierPayment, OutstandingPayment, CreateSupplierPaymentRequest } from '@core/models/supplier-payment.model';
import { Supplier } from '@core/models/purchasing.model';

@Component({
  selector: 'grocery-supplier-payments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTabsModule,
  ],
  templateUrl: './supplier-payments.component.html',
  styleUrl: './supplier-payments.component.css',
})
export class SupplierPaymentsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private paymentService = inject(SupplierPaymentService);
  private purchasingService = inject(PurchasingService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  paymentForm!: FormGroup;
  outstandingPayments = signal<OutstandingPayment[]>([]);
  supplierPayments = signal<SupplierPayment[]>([]);
  suppliers = signal<Supplier[]>([]);
  loading = signal(false);
  submitting = signal(false);
  selectedSupplierId = signal<string | null>(null);

  displayedColumns: string[] = ['supplierName', 'totalOutstanding', 'unpaidGRNs', 'lastPaymentDate', 'actions'];
  paymentColumns: string[] = ['date', 'amount', 'paymentMethod', 'referenceNumber', 'notes'];

  ngOnInit(): void {
    this.initializeForm();
    this.loadSuppliers();
    this.loadOutstandingPayments();
    
    const supplierId = this.route.snapshot.queryParamMap.get('supplierId');
    if (supplierId) {
      this.selectedSupplierId.set(supplierId);
      this.paymentForm.patchValue({ supplierId });
      this.loadSupplierPayments(supplierId);
    }
  }

  initializeForm(): void {
    this.paymentForm = this.fb.group({
      supplierId: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      paymentMethod: ['Cash', Validators.required],
      paymentDate: [new Date(), Validators.required],
      purchaseOrderId: [null],
      grnId: [null],
      referenceNumber: [''],
      notes: [''],
    });
  }

  loadSuppliers(): void {
    this.purchasingService.getSuppliers().subscribe({
      next: (response) => {
        this.suppliers.set(response.items || []);
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.toastService.error('Failed to load suppliers');
      },
    });
  }

  loadOutstandingPayments(): void {
    this.loading.set(true);
    this.paymentService.getOutstandingPayments().subscribe({
      next: (response) => {
        this.outstandingPayments.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading outstanding payments:', error);
        this.toastService.error('Failed to load outstanding payments');
        this.loading.set(false);
      },
    });
  }

  loadSupplierPayments(supplierId: string): void {
    this.loading.set(true);
    this.paymentService.getSupplierPayments(supplierId).subscribe({
      next: (response) => {
        this.supplierPayments.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading supplier payments:', error);
        this.toastService.error('Failed to load payment history');
        this.loading.set(false);
      },
    });
  }

  onSupplierSelected(supplierId: string): void {
    this.selectedSupplierId.set(supplierId);
    this.loadSupplierPayments(supplierId);
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      this.toastService.error('Please correct the form errors.');
      return;
    }

    this.submitting.set(true);
    const formValue = this.paymentForm.value;

    const request: CreateSupplierPaymentRequest = {
      supplierId: formValue.supplierId,
      amount: formValue.amount,
      paymentMethod: formValue.paymentMethod,
      paymentDate: formValue.paymentDate.toISOString(),
      purchaseOrderId: formValue.purchaseOrderId,
      grnId: formValue.grnId,
      referenceNumber: formValue.referenceNumber,
      notes: formValue.notes,
    };

    this.paymentService.createPayment(formValue.supplierId, request).subscribe({
      next: (response) => {
        this.toastService.success(`Payment of ₹${response.amount} recorded successfully.`);
        this.paymentForm.reset({
          paymentMethod: 'Cash',
          paymentDate: new Date(),
        });
        this.loadOutstandingPayments();
        this.loadSupplierPayments(formValue.supplierId);
        this.submitting.set(false);
      },
      error: (error) => {
        console.error('Error creating payment:', error);
        this.toastService.error(error?.error?.message || 'Failed to record payment.');
        this.submitting.set(false);
      },
    });
  }
}

