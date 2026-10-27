import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../auth/auth.tokens';
import { CategoryResponse } from './categories.api-models';
import { toCategory, toSaveCategoryRequest } from './categories.mappers';
import { Category, SaveCategoryFormValue } from './category.models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(): Observable<Category[]> {
    return this.http
      .get<CategoryResponse[]>(`${this.apiBaseUrl}/categorias`)
      .pipe(map((response) => response.map(toCategory)));
  }

  getById(id: string): Observable<Category> {
    return this.http
      .get<CategoryResponse>(`${this.apiBaseUrl}/categorias/${id}`)
      .pipe(map(toCategory));
  }

  create(value: SaveCategoryFormValue): Observable<Category> {
    return this.http
      .post<CategoryResponse>(`${this.apiBaseUrl}/categorias`, toSaveCategoryRequest(value))
      .pipe(map(toCategory));
  }

  update(id: string, value: SaveCategoryFormValue): Observable<Category> {
    return this.http
      .put<CategoryResponse>(`${this.apiBaseUrl}/categorias/${id}`, toSaveCategoryRequest(value))
      .pipe(map(toCategory));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/categorias/${id}`);
  }
}
