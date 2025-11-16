export enum ImportJobStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
}

export enum UpdateExistingBy {
  None = 'None',
  Barcode = 'Barcode',
  SKU = 'SKU',
}

export interface ImportJob {
  id: string;
  fileName: string;
  fileType: string;
  status: ImportJobStatus;
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  errorReportPath?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface ImportUploadResponse {
  jobId: string;
  fileName: string;
  totalRows: number;
  columns: string[];
}

export interface ImportStartRequest {
  columnMapping: Record<string, string>;
  options: ImportOptions;
}

export interface ImportOptions {
  createMissingCategories: boolean;
  updateExistingBy: UpdateExistingBy;
  generateBarcodeIfMissing: boolean;
  ignoreDuplicates: boolean;
  chunkSize: number;
}

export interface ImportProgressEvent {
  jobId: string;
  processedRows: number;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  status: ImportJobStatus;
  message?: string;
}

export interface ImportError {
  rowNumber: number;
  payload: string;
  errorMessage: string;
}

export interface ImportPreviewRow {
  rowNumber: number;
  data: Record<string, any>;
  errors?: string[];
}
