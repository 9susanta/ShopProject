import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ExcelService, ColumnMapping } from '@core/services/excel.service';

@Component({
  selector: 'grocery-column-mapping',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './column-mapping.component.html',
  styleUrl: './column-mapping.component.css',
})
export class ColumnMappingComponent {
  @Input() excelHeaders: string[] = [];
  @Input() requiredFields: string[] = [];
  @Input() fieldLabels: { [key: string]: string } = {};
  @Input() savedMappings: ColumnMapping[] = [];
  @Output() mappingComplete = new EventEmitter<ColumnMapping[]>();
  @Output() saveMapping = new EventEmitter<ColumnMapping[]>();

  mappings = signal<{ [key: string]: string }>({});
  mappingName = signal('');

  ngOnInit(): void {
    // Initialize mappings from saved mappings if available
    if (this.savedMappings.length > 0) {
      const initialMappings: { [key: string]: string } = {};
      this.savedMappings.forEach((m) => {
        initialMappings[m.fieldName] = m.excelColumn;
      });
      this.mappings.set(initialMappings);
    }
  }

  onFieldChange(fieldName: string, excelColumn: string): void {
    const current = this.mappings();
    current[fieldName] = excelColumn;
    this.mappings.set({ ...current });
  }

  getFieldLabel(fieldName: string): string {
    return this.fieldLabels[fieldName] || fieldName;
  }

  isFieldRequired(fieldName: string): boolean {
    return this.requiredFields.includes(fieldName);
  }

  onApply(): void {
    const columnMappings: ColumnMapping[] = Object.keys(this.mappings()).map((fieldName) => ({
      excelColumn: this.mappings()[fieldName],
      fieldName,
      required: this.isFieldRequired(fieldName),
    }));

    this.mappingComplete.emit(columnMappings);
  }

  onSave(): void {
    const columnMappings: ColumnMapping[] = Object.keys(this.mappings()).map((fieldName) => ({
      excelColumn: this.mappings()[fieldName],
      fieldName,
      required: this.isFieldRequired(fieldName),
    }));

    this.saveMapping.emit(columnMappings);
    this.mappingName.set('');
  }

  validateMapping(): boolean {
    // Check if all required fields are mapped
    for (const field of this.requiredFields) {
      if (!this.mappings()[field] || this.mappings()[field] === '') {
        return false;
      }
    }
    return true;
  }
}

