import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportPreviewRow } from '@core/models/import.model';

@Component({
  selector: 'grocery-preview-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-grid.component.html',
  styleUrls: ['./preview-grid.component.css'],
})
export class PreviewGridComponent {
  @Input() rows: ImportPreviewRow[] = [];
  @Input() mapping: Record<string, string> = {};
  @Output() previewComplete = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  getMappedColumns(): string[] {
    return Object.values(this.mapping).filter(col => col && col !== '');
  }

  getCellValue(row: ImportPreviewRow, column: string): any {
    return row.data[column] ?? '';
  }

  hasErrors(row: ImportPreviewRow): boolean {
    return !!(row.errors && row.errors.length > 0);
  }

  getValidRowsCount(): number {
    return this.rows.filter(r => !this.hasErrors(r)).length;
  }

  getErrorRowsCount(): number {
    return this.rows.filter(r => this.hasErrors(r)).length;
  }

  onNext(): void {
    this.previewComplete.emit();
  }

  onBack(): void {
    this.back.emit();
  }
}

