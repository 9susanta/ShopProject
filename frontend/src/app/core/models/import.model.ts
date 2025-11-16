export interface ImportJob {
  id: string;
  status: ImportStatus;
  fileName: string;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  errors?: string[];
  createdAt: string;
  completedAt?: string;
  startedAt?: string;
}

export enum ImportStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
}

export interface ImportUploadResponse {
  jobId: string;
  fileName: string;
  totalRows: number;
  previewRows: any[][];
  headers: string[];
}

export interface ImportMapping {
  [key: string]: string; // column name -> product field name
}

export interface ImportStartRequest {
  mapping: ImportMapping;
}

export interface ImportStatusResponse {
  job: ImportJob;
  progress: number; // 0-100
}


