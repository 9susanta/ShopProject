import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription, firstValueFrom } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ImportService } from './import.service';
import { SignalRService } from '../../core/services/signalr.service';
import { ImportJobStatus, ImportJob } from '../../core/models/import.model';
import { FileImportComponent, FilePreview } from '../shared/components/file-import/file-import.component';

@Component({
  selector: 'grocery-import-upload',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressBarModule,
    FileImportComponent
  ],
  templateUrl: './import-upload.component.html',
  styleUrls: ['./import-upload.component.css'],
})
export class ImportUploadComponent implements OnInit, OnDestroy {
  // Using inject() (Angular 20 feature)
  private importService = inject(ImportService);
  private signalRService = inject(SignalRService);

  // Signal-based state
  selectedFile = signal<File | null>(null);
  preview = signal<FilePreview | null>(null);
  mapping = signal<{ [key: string]: string }>({});
  currentJobId = signal<string | null>(null);
  importStatus = signal<ImportJob | null>(null);
  isUploading = signal<boolean>(false);
  isImporting = signal<boolean>(false);
  progress = signal<number>(0);
  errors = signal<string[]>([]);

  // Convert SignalR observable to signal
  private importProgress$ = this.signalRService.importProgress$;
  private importProgressSignal = toSignal(this.importProgress$, { initialValue: null });

  productFields: string[] = [
    'name',
    'description',
    'price',
    'cost',
    'stock',
    'barcode',
    'sku',
    'categoryName',
    'supplierName',
    'unit',
    'lowStockThreshold',
  ];

  // Computed signal for validation
  hasRequiredFields = computed(() => {
    const requiredFields = ['name', 'price'];
    const mappedFields = Object.values(this.mapping()).filter((f) => f);
    return requiredFields.every((field) => mappedFields.includes(field));
  });

  // Helper methods for mapping signal
  getMappingValue(header: string): string {
    return this.mapping()[header] || '';
  }

  setMappingValue(header: string, value: string): void {
    this.mapping.update(current => {
      const updated = { ...current };
      updated[header] = value;
      return updated;
    });
  }

  private subscriptions = new Subscription();
  private pollingSubscription: Subscription | null = null;

  ngOnInit(): void {
    // Subscribe to SignalR import progress events
    this.subscriptions.add(
      this.signalRService.importProgress$.subscribe((event) => {
        if (event.jobId === this.currentJobId()) {
          this.progress.set(event.progress);
          this.updateStatusFromProgress(event);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
  }

  onPreviewReady(preview: FilePreview): void {
    this.preview.set(preview);
    this.initializeMapping();
  }

  private initializeMapping(): void {
    const currentPreview = this.preview();
    if (!currentPreview) {
      return;
    }

    // Auto-map common column names
    const autoMap: { [key: string]: string } = {
      name: 'name',
      product: 'name',
      'product name': 'name',
      description: 'description',
      price: 'price',
      cost: 'cost',
      stock: 'stock',
      quantity: 'stock',
      barcode: 'barcode',
      sku: 'sku',
      category: 'categoryName',
      'category name': 'categoryName',
      supplier: 'supplierName',
      'supplier name': 'supplierName',
      unit: 'unit',
      threshold: 'lowStockThreshold',
    };

    const newMapping: { [key: string]: string } = {};
    currentPreview.headers.forEach((header) => {
      const lowerHeader = header.toLowerCase().trim();
      if (autoMap[lowerHeader]) {
        newMapping[header] = autoMap[lowerHeader];
      } else {
        newMapping[header] = '';
      }
    });
    this.mapping.set(newMapping);
  }

  async uploadFile(): Promise<void> {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    this.isUploading.set(true);
    this.errors.set([]);

    try {
      const response = await firstValueFrom(this.importService.uploadFile(file));
             if (response) {
               this.currentJobId.set(response.jobId);
               // Note: ImportUploadResponse doesn't include preview data
               // Preview should be handled by FileImportComponent
             }
    } catch (error: any) {
      console.error('Upload failed:', error);
      this.errors.set([error.userMessage || 'Failed to upload file']);
    } finally {
      this.isUploading.set(false);
    }
  }

  async startImport(): Promise<void> {
    if (!this.currentJobId() || !this.preview()) {
      return;
    }

    if (!this.hasRequiredFields()) {
      this.errors.set(['Please map at least "name" and "price" fields']);
      return;
    }

    this.isImporting.set(true);
    this.progress.set(0);
    this.errors.set([]);

           try {
             await firstValueFrom(
               this.importService.startImport(this.currentJobId()!, this.mapping())
             );
      this.startStatusPolling();
    } catch (error: any) {
      console.error('Import start failed:', error);
      this.errors.set([error.userMessage || 'Failed to start import']);
      this.isImporting.set(false);
    }
  }

  private startStatusPolling(): void {
    const jobId = this.currentJobId();
    if (!jobId) {
      return;
    }

    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }

    this.pollingSubscription = this.importService
      .pollImportStatus(jobId, 2000)
      .subscribe({
        next: (response) => {
          this.importStatus.set(response.job);
          this.progress.set(response.progress);

          if (
            response.job.status === ImportJobStatus.Completed ||
            response.job.status === ImportJobStatus.Failed ||
            response.job.status === ImportJobStatus.Cancelled
          ) {
            this.isImporting.set(false);
            if (response.job.errorMessage) {
              this.errors.set([response.job.errorMessage]);
            }
          }
        },
        error: (error) => {
          console.error('Status polling error:', error);
          this.isImporting.set(false);
        },
      });
  }

  private updateStatusFromProgress(event: any): void {
    if (event.status) {
      const file = this.selectedFile();
      this.importStatus.set({
        id: event.jobId,
        status: event.status as ImportJobStatus,
        fileName: file?.name || '',
        fileType: file?.name.endsWith('.json') ? 'json' : 'xlsx',
        totalRows: event.totalRows || 0,
        processedRows: event.processedRows || 0,
        successfulRows: event.successfulRows || 0,
        failedRows: event.failedRows || 0,
        createdAt: new Date().toISOString(),
      } as ImportJob);
    }

    if (event.errors) {
      this.errors.set(event.errors);
    }
  }

  reset(): void {
    this.selectedFile.set(null);
    this.preview.set(null);
    this.mapping.set({});
    this.currentJobId.set(null);
    this.importStatus.set(null);
    this.isUploading.set(false);
    this.isImporting.set(false);
    this.progress.set(0);
    this.errors.set([]);

    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }
}
