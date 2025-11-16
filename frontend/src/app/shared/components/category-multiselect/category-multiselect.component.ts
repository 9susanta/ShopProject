import { Component, input, output, signal, viewChild, ElementRef, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'grocery-category-multiselect',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-multiselect.component.html',
  styleUrls: ['./category-multiselect.component.css'],
})
export class CategoryMultiselectComponent {
  // Inputs
  categories = input<Category[]>([]);
  selectedCategoryIds = input<string[]>([]);
  placeholder = input<string>('Select Categories');

  // Outputs
  selectionChange = output<string[]>();

  // Internal state
  isOpen = signal(false);
  searchTerm = signal('');
  filteredCategories = signal<Category[]>([]);
  selectedIds = signal<string[]>([]);
  
  // View child for dropdown container
  dropdownRef = viewChild<ElementRef<HTMLDivElement>>('dropdown');

  constructor() {
    // Initialize with empty array
    this.filteredCategories.set([]);
    
    // Sync selectedIds when input changes (Angular 20 effect)
    effect(() => {
      try {
        const inputIds = this.selectedCategoryIds();
        if (Array.isArray(inputIds)) {
          this.selectedIds.set([...inputIds]);
        }
      } catch (error) {
        console.error('Error syncing selected IDs:', error);
        this.selectedIds.set([]);
      }
    });

    // Update filtered categories when search term or categories change
    effect(() => {
      try {
        const cats = this.categories();
        const term = this.searchTerm();
        if (Array.isArray(cats)) {
          this.updateFilteredCategories();
        } else {
          this.filteredCategories.set([]);
        }
      } catch (error) {
        console.error('Error in filter effect:', error);
        this.filteredCategories.set([]);
      }
    });
  }

  toggleDropdown(): void {
    this.isOpen.update(open => !open);
    if (this.isOpen()) {
      this.updateFilteredCategories();
    }
  }

  closeDropdown(): void {
    this.isOpen.set(false);
    this.searchTerm.set('');
    this.updateFilteredCategories();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.updateFilteredCategories();
  }

  updateFilteredCategories(): void {
    try {
      const term = this.searchTerm().toLowerCase().trim();
      const allCategories = this.categories() || [];
      
      if (!term) {
        this.filteredCategories.set(allCategories);
      } else {
        const filtered = allCategories.filter(cat =>
          cat && cat.name && cat.name.toLowerCase().includes(term)
        );
        this.filteredCategories.set(filtered);
      }
    } catch (error) {
      console.error('Error updating filtered categories:', error);
      this.filteredCategories.set([]);
    }
  }

  toggleCategory(categoryId: string): void {
    this.selectedIds.update(ids => {
      const index = ids.indexOf(categoryId);
      if (index > -1) {
        // Remove if already selected
        return ids.filter(id => id !== categoryId);
      } else {
        // Add if not selected
        return [...ids, categoryId];
      }
    });
    
    // Emit selection change
    this.selectionChange.emit([...this.selectedIds()]);
  }

  isSelected(categoryId: string): boolean {
    return this.selectedIds().includes(categoryId);
  }

  clearSelection(): void {
    this.selectedIds.set([]);
    this.selectionChange.emit([]);
  }

  selectAll(): void {
    const allIds = this.filteredCategories().map(cat => cat.id);
    this.selectedIds.set([...allIds]);
    this.selectionChange.emit([...allIds]);
  }

  getDisplayText(): string {
    try {
      const selected = this.selectedIds();
      const cats = this.categories() || [];
      
      if (selected.length === 0) {
        return this.placeholder();
      }
      if (selected.length === 1) {
        const category = cats.find(cat => cat && cat.id === selected[0]);
        return category?.name || this.placeholder();
      }
      return `${selected.length} selected`;
    } catch (error) {
      console.error('Error getting display text:', error);
      return this.placeholder();
    }
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const dropdown = this.dropdownRef()?.nativeElement;
    if (dropdown && !dropdown.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }
}

