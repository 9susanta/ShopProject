import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/api/api.service';
import {
  ImportJob,
  ImportUploadResponse,
  ImportStartRequest,
  ImportPreviewRow,
  ImportJobStatus,
} from '@core/models/import.model';

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  private api = inject(ApiService);

  uploadFile(file: File): Observable<ImportUploadResponse> {
    return this.api.uploadFile<ImportUploadResponse>('admin/imports/upload', file);
  }

  startImport(jobId: string, request: ImportStartRequest): Observable<void> {
    return this.api.post<void>(`admin/imports/${jobId}/start`, request);
  }

  getJobStatus(jobId: string): Observable<ImportJob> {
    return this.api.get<ImportJob>(`admin/imports/${jobId}/status`, {
      cache: false,
    });
  }

  getPreview(jobId: string, maxRows: number = 50): Observable<ImportPreviewRow[]> {
    return this.api.get<ImportPreviewRow[]>(`admin/imports/${jobId}/preview`, {
      params: { maxRows },
      cache: false,
    });
  }

  downloadErrorReport(jobId: string): Observable<Blob> {
    return this.api.downloadFile(`admin/imports/${jobId}/errors/download`);
  }

  getJobs(status?: ImportJobStatus): Observable<ImportJob[]> {
    const params = status ? { status } : {};
    return this.api.get<ImportJob[]>('admin/imports/jobs', {
      params,
      cache: true,
      cacheTTL: 30000,
    });
  }

  cancelJob(jobId: string): Observable<void> {
    return this.api.post<void>(`admin/imports/${jobId}/cancel`, {});
  }

  retryFailedRows(jobId: string): Observable<void> {
    return this.api.post<void>(`admin/imports/${jobId}/retry`, {});
  }
}

