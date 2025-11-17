import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportOptions, UpdateExistingBy } from '@core/models/import.model';

@Component({
  selector: 'grocery-import-options',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './import-options.component.html',
  styleUrls: ['./import-options.component.css'],
})
export class ImportOptionsComponent {
  @Input() options: ImportOptions = {
    createMissingCategories: true,
    updateExistingBy: UpdateExistingBy.Barcode,
    generateBarcodeIfMissing: false,
    ignoreDuplicates: false,
    chunkSize: 200,
  };
  @Output() optionsComplete = new EventEmitter<ImportOptions>();
  @Output() back = new EventEmitter<void>();

  localOptions = signal<ImportOptions>({ ...this.options });

  readonly updateByOptions = [
    { value: UpdateExistingBy.None, label: 'Do not update existing' },
    { value: UpdateExistingBy.Barcode, label: 'Update by Barcode' },
    { value: UpdateExistingBy.SKU, label: 'Update by SKU' },
  ];

  updateOption<K extends keyof ImportOptions>(key: K, value: ImportOptions[K]): void {
    this.localOptions.update(current => ({
      ...current,
      [key]: value,
    }));
  }

  onStart(): void {
    this.optionsComplete.emit(this.localOptions());
  }

  onBack(): void {
    this.back.emit();
  }
}

