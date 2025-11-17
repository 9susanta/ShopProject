import { Component, EventEmitter, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportService } from '../services/import.service';
import { ImportUploadResponse } from '@core/models/import.model';
import { ToastService } from '@core/toast/toast.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'grocery-import-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-upload.component.html',
  styleUrls: ['./import-upload.component.css'],
})
export class ImportUploadComponent {
  private importService = inject(ImportService);
  private toastService = inject(ToastService);

  @Output() fileUploaded = new EventEmitter<ImportUploadResponse>();

  isDragging = signal(false);
  isUploading = signal(false);
  selectedFile = signal<File | null>(null);
  error = signal<string | null>(null);

  readonly maxFileSize = environment.maxUploadSize;
  readonly allowedTypes = ['.xlsx', '.xls', '.json'];

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.error.set(null);

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.allowedTypes.includes(fileExtension)) {
      this.error.set(`Invalid file type. Allowed types: ${this.allowedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      this.error.set(`File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`);
      return;
    }

    this.selectedFile.set(file);
    this.uploadFile(file);
  }

  private uploadFile(file: File): void {
    this.isUploading.set(true);
    this.error.set(null);

    this.importService.uploadFile(file).subscribe({
      next: (response) => {
        this.isUploading.set(false);
        this.toastService.success('File uploaded successfully');
        this.fileUploaded.emit(response);
      },
      error: (error) => {
        this.isUploading.set(false);
        this.error.set(error.message || 'Upload failed. Please try again.');
        this.toastService.error('File upload failed');
      },
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

