import { Component, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ImportUploadComponent } from '../import-upload/import-upload.component';
import { ColumnMappingComponent } from '../column-mapping/column-mapping.component';
import { PreviewGridComponent } from '../preview-grid/preview-grid.component';
import { ImportOptionsComponent } from '../import-options/import-options.component';
import { ImportService } from '../import.service';
import { ImportUploadResponse, ImportStartRequest, ImportPreviewRow, ImportOptions, UpdateExistingBy } from '@core/models/import.model';
import { ToastService } from '@core/toast/toast.service';
import { SignalRService } from '@core/services/signalr.service';
import { Subscription } from 'rxjs';

enum ImportStep {
  Upload = 1,
  Mapping = 2,
  Preview = 3,
  Options = 4,
  Processing = 5,
}

@Component({
  selector: 'grocery-import-page',
  standalone: true,
  imports: [
    CommonModule,
    ImportUploadComponent,
    ColumnMappingComponent,
    PreviewGridComponent,
    ImportOptionsComponent,
  ],
  templateUrl: './import-page.component.html',
  styleUrls: ['./import-page.component.css'],
})
export class ImportPageComponent implements OnDestroy {
  private importService = inject(ImportService);
  private toastService = inject(ToastService);
  private signalRService = inject(SignalRService);
  private router = inject(Router);

  currentStep = signal<ImportStep>(ImportStep.Upload);
  uploadedFile = signal<File | null>(null);
  uploadResponse = signal<ImportUploadResponse | null>(null);
  previewRows = signal<ImportPreviewRow[]>([]);
  columnMapping = signal<Record<string, string>>({});
  importOptions = signal<ImportOptions>({
    createMissingCategories: true,
    updateExistingBy: UpdateExistingBy.Barcode,
    generateBarcodeIfMissing: false,
    ignoreDuplicates: false,
    chunkSize: 200,
  });
  isProcessing = signal(false);
  jobId = signal<string | null>(null);

  private subscriptions = new Subscription();

  readonly ImportStep = ImportStep;

  ngOnInit(): void {
    // Subscribe to SignalR import progress updates
    if (this.signalRService && this.signalRService.importProgress$) {
      const progressSub = this.signalRService.importProgress$.subscribe((event: any) => {
        if (event.jobId === this.jobId()) {
          if (event.status === 'Completed' || event.status === 'Failed') {
            this.isProcessing.set(false);
            this.toastService.success(`Import ${event.status.toLowerCase()}`);
            this.router.navigate(['/admin/imports/jobs', event.jobId]);
          }
        }
      });
      this.subscriptions.add(progressSub);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onFileUploaded(response: ImportUploadResponse): void {
    this.uploadResponse.set(response);
    this.currentStep.set(ImportStep.Mapping);
    this.loadPreview();
  }

  onMappingComplete(mapping: Record<string, string>): void {
    this.columnMapping.set(mapping);
    this.currentStep.set(ImportStep.Preview);
  }

  onPreviewComplete(): void {
    this.currentStep.set(ImportStep.Options);
  }

  onOptionsComplete(options: ImportOptions): void {
    this.importOptions.set(options);
    this.startImport();
  }

  private async loadPreview(): Promise<void> {
    const response = this.uploadResponse();
    if (!response) return;

    try {
      const preview = await this.importService.getPreview(response.jobId, 50).toPromise();
      this.previewRows.set(preview || []);
    } catch (error) {
      this.toastService.error('Failed to load preview');
      console.error('Preview load error:', error);
    }
  }

  private async startImport(): Promise<void> {
    const response = this.uploadResponse();
    if (!response) return;

    this.isProcessing.set(true);
    this.currentStep.set(ImportStep.Processing);

    const request: ImportStartRequest = {
      columnMapping: this.columnMapping(),
      options: this.importOptions(),
    };

    try {
      await this.importService.startImport(response.jobId, request).toPromise();
      this.jobId.set(response.jobId);
      this.toastService.info('Import started. You will be redirected when complete.');
    } catch (error) {
      this.isProcessing.set(false);
      this.toastService.error('Failed to start import');
      console.error('Import start error:', error);
    }
  }

  goBack(): void {
    const step = this.currentStep();
    if (step > ImportStep.Upload) {
      this.currentStep.set((step - 1) as ImportStep);
    }
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? All progress will be lost.')) {
      this.router.navigate(['/admin/imports/jobs']);
    }
  }
}

