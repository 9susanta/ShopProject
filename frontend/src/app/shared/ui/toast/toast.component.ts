import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '@core/toast/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'grocery-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent implements OnInit, OnDestroy {
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  
  // Use signal for reactive updates in zoneless mode
  toasts = signal<Toast[]>([]);

  ngOnInit(): void {
    this.toastService.toasts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(toast => {
        // Update signal - this will trigger change detection in zoneless mode
        this.toasts.update(toasts => [...toasts, toast]);
        
        if (toast.duration && toast.duration > 0) {
          // setTimeout callbacks need explicit change detection in zoneless mode
          setTimeout(() => {
            this.removeToast(toast.id);
            this.cdr.markForCheck(); // Explicitly mark for check
          }, toast.duration);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeToast(id: string): void {
    // Update signal - this will trigger change detection
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
    this.cdr.markForCheck(); // Explicitly mark for check
  }

  getToastClass(type: Toast['type']): string {
    const classes: Record<Toast['type'], string> = {
      success: 'toast-success',
      error: 'toast-error',
      warning: 'toast-warning',
      info: 'toast-info',
    };
    return classes[type] || 'toast-info';
  }
}

