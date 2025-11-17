import { Component, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'grocery-image-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.css'],
})
export class ImagePreviewComponent implements OnChanges {
  @Input() imageUrl: string | null = null;
  @Input() file: File | null = null;
  @Output() remove = new EventEmitter<void>();

  previewUrl = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (this.file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl.set(e.target.result);
      };
      reader.readAsDataURL(this.file);
    } else if (this.imageUrl) {
      this.previewUrl.set(this.imageUrl);
    } else {
      this.previewUrl.set(null);
    }
  }

  onRemove(): void {
    this.remove.emit();
  }
}

