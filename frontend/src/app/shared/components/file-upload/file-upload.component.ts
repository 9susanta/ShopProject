import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'grocery-file-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatCardModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
})
export class FileUploadComponent {
  @Input() accept: string = '*/*';
  @Input() maxSize: number = 10 * 1024 * 1024; // 10MB default
  @Input() multiple: boolean = false;
  @Input() label: string = 'Upload File';
  @Output() fileSelected = new EventEmitter<File | File[]>();
  @Output() uploadProgress = new EventEmitter<number>();

  selectedFile = signal<File | null>(null);
  selectedFiles = signal<File[]>([]);
  uploading = signal(false);
  uploadProgressValue = signal(0);
  error = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.error.set(null);

      if (this.multiple) {
        const files = Array.from(input.files);
        this.validateFiles(files);
        this.selectedFiles.set(files);
        this.fileSelected.emit(files);
      } else {
        const file = input.files[0];
        this.validateFile(file);
        this.selectedFile.set(file);
        this.fileSelected.emit(file);
      }
    }
  }

  validateFile(file: File): void {
    if (file.size > this.maxSize) {
      this.error.set(`File size exceeds ${this.maxSize / 1024 / 1024}MB limit`);
      this.selectedFile.set(null);
      return;
    }
  }

  validateFiles(files: File[]): void {
    const invalidFiles = files.filter((f) => f.size > this.maxSize);
    if (invalidFiles.length > 0) {
      this.error.set(`${invalidFiles.length} file(s) exceed size limit`);
      return;
    }
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.selectedFiles.set([]);
    this.error.set(null);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

