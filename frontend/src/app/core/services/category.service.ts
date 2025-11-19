import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { CategoryDto, CategoryCreateRequest, CategoryUpdateRequest } from '@core/models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private api = inject(ApiService);

  /**
   * Get all categories
   */
  getCategories(isActive?: boolean): Observable<CategoryDto[]> {
    const params: any = {};
    if (isActive !== undefined) {
      params.isActive = isActive;
    }
    return this.api.get<CategoryDto[]>('categories', {
      params,
      cache: true,
      cacheKey: `categories_${isActive ?? 'all'}`,
      cacheTTL: 600000, // 10 minutes
    });
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: string): Observable<CategoryDto> {
    return this.api.get<CategoryDto>(`categories/${id}`, {
      cache: true,
      cacheKey: `category_${id}`,
      cacheTTL: 600000,
    });
  }

  /**
   * Create a new category
   */
  createCategory(category: CategoryCreateRequest): Observable<CategoryDto> {
    return this.api.post<CategoryDto>('categories', category);
  }

  /**
   * Update a category
   */
  updateCategory(category: CategoryUpdateRequest): Observable<CategoryDto> {
    return this.api.put<CategoryDto>(`categories/${category.id}`, category);
  }

  /**
   * Delete a category (if needed)
   */
  deleteCategory(id: string): Observable<void> {
    return this.api.delete<void>(`categories/${id}`);
  }
}

