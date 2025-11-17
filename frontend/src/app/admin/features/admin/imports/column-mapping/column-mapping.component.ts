import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const PRODUCT_FIELDS = [
  { value: 'name', label: 'Product Name', required: true },
  { value: 'sku', label: 'SKU', required: false },
  { value: 'barcode', label: 'Barcode', required: false },
  { value: 'mrp', label: 'MRP', required: true },
  { value: 'salePrice', label: 'Sale Price', required: true },
  { value: 'gstRate', label: 'GST Rate', required: false },
  { value: 'category', label: 'Category', required: true },
  { value: 'unit', label: 'Unit', required: false },
  { value: 'quantity', label: 'Quantity', required: false },
  { value: 'description', label: 'Description', required: false },
  { value: 'supplier', label: 'Supplier', required: false },
];

@Component({
  selector: 'grocery-column-mapping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './column-mapping.component.html',
  styleUrls: ['./column-mapping.component.css'],
})
export class ColumnMappingComponent {
  @Input() columns: string[] = [];
  @Output() mappingComplete = new EventEmitter<Record<string, string>>();
  @Output() back = new EventEmitter<void>();

  mapping = signal<Record<string, string>>({});
  readonly productFields = PRODUCT_FIELDS;

  requiredFieldsMapped = computed(() => {
    const mapped = this.mapping();
    return this.productFields
      .filter(f => f.required)
      .every(f => mapped[f.value] && mapped[f.value] !== '');
  });

  updateMapping(field: string, column: string): void {
    this.mapping.update(current => ({
      ...current,
      [field]: column,
    }));
  }

  onNext(): void {
    if (this.requiredFieldsMapped()) {
      this.mappingComplete.emit(this.mapping());
    }
  }

  onBack(): void {
    this.back.emit();
  }

  getMappedColumn(field: string): string {
    return this.mapping()[field] || '';
  }
}

