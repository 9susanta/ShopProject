import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '@core/models/product.model';

@Component({
  selector: 'grocery-category-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-nav.component.html',
  styleUrls: ['./category-nav.component.css'],
})
export class CategoryNavComponent {
  @Input() products: Product[] = [];
  @Output() categorySelected = new EventEmitter<string | null>();

  selectedCategory = signal<string | null>(null);

  categories = computed(() => {
    const categoryMap = new Map<string, { id: string; name: string; count: number }>();
    
    this.products.forEach(product => {
      const categoryId = product.categoryId;
      const categoryName = product.categoryName || 'Uncategorized';
      
      if (categoryMap.has(categoryId)) {
        const existing = categoryMap.get(categoryId)!;
        existing.count++;
      } else {
        categoryMap.set(categoryId, { id: categoryId, name: categoryName, count: 1 });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  });

  selectCategory(categoryId: string | null): void {
    this.selectedCategory.set(categoryId);
    this.categorySelected.emit(categoryId);
  }
}

