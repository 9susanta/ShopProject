import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import {
  ImportUploadResponse,
  ImportStartRequest,
  ImportStatusResponse,
  ImportJob,
} from '../../core/models/import.model';
import { FilePreview } from '../../shared/components/file-import/file-import.component';

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  constructor(private api: ApiService) {}

  /**
   * Upload import file
   * Calls POST /admin/imports/upload
   */
  uploadFile(file: File): Observable<ImportUploadResponse> {
    return this.api.uploadFile<ImportUploadResponse>('admin/imports/upload', file);
  }

  /**
   * Start import job with mapping
   * Calls POST /admin/imports/{jobId}/start
   */
  startImport(jobId: string, mapping: { [key: string]: string }): Observable<void> {
    const payload: ImportStartRequest = { mapping };
    return this.api.post<void>(`admin/imports/${jobId}/start`, payload);
  }

  /**
   * Get import job status
   * Calls GET /admin/imports/{jobId}/status
   */
  getImportStatus(jobId: string): Observable<ImportStatusResponse> {
    return this.api.get<ImportStatusResponse>(`admin/imports/${jobId}/status`);
  }

  /**
   * Poll import status until complete
   */
  pollImportStatus(jobId: string, intervalMs = 2000): Observable<ImportStatusResponse> {
    return interval(intervalMs).pipe(
      switchMap(() => this.getImportStatus(jobId)),
      takeWhile(
        (response) =>
          response.job.status !== 'Completed' &&
          response.job.status !== 'Failed' &&
          response.job.status !== 'Cancelled',
        true
      )
    );
  }
}


