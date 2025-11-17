import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CategoryService } from '@core/services/category.service';
import { TaxSlabService } from '@core/services/taxslab.service';
import { ToastService } from '@core/toast/toast.service';
import { CategoryDto, CategoryCreateRequest } from '@core/models/category.model';
import { TaxSlabDto } from '@core/models/taxslab.model';

@Component({
  selector: 'grocery-category-create-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './category-create-modal.component.html',
  styleUrls: ['./category-create-modal.component.css'],
})
export class CategoryCreateModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CategoryCreateModalComponent>);
  private categoryService = inject(CategoryService);
  private taxSlabService = inject(TaxSlabService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  categoryForm: FormGroup;
  taxSlabs = signal<TaxSlabDto[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      taxSlabId: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadTaxSlabs();
    
    // Trap focus within modal
    const modalElement = document.querySelector('.mat-mdc-dialog-container');
    if (modalElement) {
      (modalElement as HTMLElement).focus();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTaxSlabs(): void {
    this.isLoading.set(true);
    this.taxSlabService
      .getTaxSlabs(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: taxSlabs => {
          this.taxSlabs.set(taxSlabs);
          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
        error: error => {
          console.error('Error loading tax slabs:', error);
          this.toastService.error('Failed to load tax slabs');
          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
      });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.categoryForm.value;
    const request: CategoryCreateRequest = {
      name: formValue.name.trim(),
      description: formValue.description?.trim() || undefined,
      taxSlabId: formValue.taxSlabId,
    };

    this.categoryService
      .createCategory(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (category: CategoryDto) => {
          this.toastService.success('Category created successfully');
          this.dialogRef.close(category);
        },
        error: (error: any) => {
          console.error('Error creating category:', error);
          const errorMessage = error?.error?.message || 'Failed to create category';
          this.toastService.error(errorMessage);
          this.isSubmitting.set(false);
          this.cdr.markForCheck();
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onKeyDown(event: KeyboardEvent): void {
    // ESC to close
    if (event.key === 'Escape') {
      this.onCancel();
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.categoryForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName} is required`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    return '';
  }
}

