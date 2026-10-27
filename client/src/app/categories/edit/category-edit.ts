import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucidePencil, LucideTags } from '@lucide/angular';

import { ProblemDetails } from '../../shared/models/problem-details.model';
import { createCategoryForm } from '../category-form';
import { SaveCategoryFormValue } from '../category.models';
import { CategoriesService } from '../categories.service';

@Component({
  imports: [FormField, LucideArrowLeft, LucidePencil, LucideTags, RouterLink],
  selector: 'app-category-edit',
  templateUrl: './category-edit.html',
})
export class CategoryEdit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pageTitle = viewChild<ElementRef<HTMLHeadingElement>>('pageTitle');

  private readonly categoryId = this.route.snapshot.paramMap.get('categoryId') ?? '';

  protected readonly model = signal<SaveCategoryFormValue>({ title: '' });
  protected readonly categoryForm = createCategoryForm(this.model);
  protected readonly errorMessage = signal('');
  protected readonly titleError = signal('');
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);

  constructor() {
    afterNextRender(() => this.pageTitle()?.nativeElement.focus());
    this.loadCategory();
  }

  protected submit(event: SubmitEvent): void {
    event.preventDefault();

    const form = this.categoryForm();

    if (form.invalid() || this.isLoading()) {
      form.markAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.titleError.set('');
    this.isSubmitting.set(true);

    this.categoriesService.update(this.categoryId, this.model()).subscribe({
      next: () => {
        void this.router.navigateByUrl('/workspace/categories');
      },
      error: (response: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.setApiErrors(response);
      },
    });
  }

  private loadCategory(): void {
    if (!this.categoryId) {
      this.errorMessage.set('The category could not be found.');
      this.isLoading.set(false);
      return;
    }

    this.categoriesService.getById(this.categoryId).subscribe({
      next: (category) => {
        this.model.set({ title: category.title });
        this.isLoading.set(false);
      },
      error: (response: HttpErrorResponse) => {
        const problem = response.error as ProblemDetails | null;

        this.errorMessage.set(problem?.detail ?? 'We could not load this category. Try again.');
        this.isLoading.set(false);
      },
    });
  }

  private setApiErrors(response: HttpErrorResponse): void {
    const problem = response.error as ProblemDetails | null;
    const titleError = problem?.errors?.['titulo']?.[0];

    if (titleError) {
      this.titleError.set(titleError);
      return;
    }

    this.errorMessage.set(problem?.detail ?? 'We could not update the category. Try again.');
  }
}
