import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideAlertTriangle,
  LucideCheckCircle2,
  LucidePencil,
  LucidePlus,
  LucideRefreshCw,
  LucideTags,
  LucideTrash2,
  LucideX,
} from '@lucide/angular';

import { ProblemDetails } from '../../shared/models/problem-details.model';
import { Category } from '../category.models';
import { CategoriesService } from '../categories.service';

@Component({
  imports: [
    LucideAlertCircle,
    LucideAlertTriangle,
    LucideCheckCircle2,
    LucidePencil,
    LucidePlus,
    LucideRefreshCw,
    LucideTags,
    LucideTrash2,
    LucideX,
    RouterLink,
  ],
  selector: 'app-categories-list',
  templateUrl: './categories-list.html',
})
export class CategoriesList {
  private readonly categoriesService = inject(CategoriesService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly categoryPendingDeletion = signal<Category | null>(null);
  protected readonly deleteError = signal('');
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isDeleting = signal(false);
  protected readonly isLoading = signal(true);

  constructor() {
    this.loadCategories();
  }

  protected retry(): void {
    this.loadCategories();
  }

  protected requestDeletion(category: Category): void {
    this.categoryPendingDeletion.set(category);
    this.deleteError.set('');
  }

  protected cancelDeletion(): void {
    if (this.isDeleting()) {
      return;
    }

    this.categoryPendingDeletion.set(null);
    this.deleteError.set('');
  }

  protected confirmDeletion(): void {
    const category = this.categoryPendingDeletion();

    if (!category || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.deleteError.set('');

    this.categoriesService.delete(category.id).subscribe({
      next: () => {
        this.categories.update((categories) =>
          categories.filter((currentCategory) => currentCategory.id !== category.id),
        );
        this.categoryPendingDeletion.set(null);
        this.successMessage.set(`Category "${category.title}" was deleted.`);
        this.isDeleting.set(false);
      },
      error: (response: HttpErrorResponse) => {
        const problem = response.error as ProblemDetails | null;

        this.deleteError.set(problem?.detail ?? 'We could not delete this category. Try again.');
        this.isDeleting.set(false);
      },
    });
  }

  private loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

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
