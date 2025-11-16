import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as XLSX from 'xlsx';

export interface FilePreview {
  headers: string[];
  rows: any[][];
  fileName: string;
  fileType: string;
}

@Component({
  selector: 'grocery-file-import',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './file-import.component.html',
  styleUrls: ['./file-import.component.css'],
})
export class FileImportComponent {
  // Signal-based inputs
  acceptedTypes = input<string>('.xlsx,.xls,.json');
  maxPreviewRows = input<number>(20);

  // Signal-based outputs
  fileSelected = output<File>();
  previewReady = output<FilePreview>();

  // Signal-based state
  selectedFile = signal<File | null>(null);
  preview = signal<FilePreview | null>(null);
  isProcessing = signal(false);
  componentId = Math.random().toString(36).substring(7);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile.set(file);
      this.fileSelected.emit(file);
      this.processFile(file);
    }
  }

  private async processFile(file: File): Promise<void> {
    this.isProcessing.set(true);

    try {
      if (file.name.endsWith('.json')) {
        await this.processJsonFile(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        await this.processExcelFile(file);
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please check the file format.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  private async processJsonFile(file: File): Promise<void> {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('JSON file must contain an array of objects');
    }

    const headers = Object.keys(data[0]);
    const rows = data.slice(0, this.maxPreviewRows()).map((row) =>
      headers.map((header) => row[header] ?? '')
    );

    const preview: FilePreview = {
      headers,
      rows,
      fileName: file.name,
      fileType: 'json',
    };

    this.preview.set(preview);
    this.previewReady.emit(preview);
  }

  private async processExcelFile(file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (data.length === 0) {
      throw new Error('Excel file is empty');
    }

    const headers = (data[0] as string[]) || [];
    const rows = data.slice(1, this.maxPreviewRows() + 1);

    const preview: FilePreview = {
      headers,
      rows,
      fileName: file.name,
      fileType: 'xlsx',
    };

    this.preview.set(preview);
    this.previewReady.emit(preview);
  }

  clear(): void {
    this.selectedFile.set(null);
    this.preview.set(null);
  }
}
