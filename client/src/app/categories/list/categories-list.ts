import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAlertCircle, LucidePlus, LucideRefreshCw, LucideTags } from '@lucide/angular';

import { ProblemDetails } from '../../shared/models/problem-details.model';
import { Category } from '../category.models';
import { CategoriesService } from '../categories.service';

@Component({
  imports: [LucideAlertCircle, LucidePlus, LucideRefreshCw, LucideTags, RouterLink],
  selector: 'app-categories-list',
  templateUrl: './categories-list.html',
})
export class CategoriesList {
  private readonly categoriesService = inject(CategoriesService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(true);

  constructor() {
    this.loadCategories();
  }

  protected retry(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.categoriesService.list().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoading.set(false);
      },
      error: (response: HttpErrorResponse) => {
        const problem = response.error as ProblemDetails | null;

        this.errorMessage.set(problem?.detail ?? 'We could not load your categories. Try again.');
        this.isLoading.set(false);
      },
    });
  }
}
