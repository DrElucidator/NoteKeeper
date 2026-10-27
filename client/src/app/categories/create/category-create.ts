import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { FormField, maxLength, minLength, form, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucidePlus, LucideTags } from '@lucide/angular';

import { ProblemDetails } from '../../shared/models/problem-details.model';
import { SaveCategoryFormValue } from '../category.models';
import { CategoriesService } from '../categories.service';

@Component({
  imports: [FormField, LucideArrowLeft, LucidePlus, LucideTags, RouterLink],
  selector: 'app-category-create',
  templateUrl: './category-create.html',
})
export class CategoryCreate {
  private readonly categoriesService = inject(CategoriesService);
  private readonly router = inject(Router);
  private readonly pageTitle = viewChild<ElementRef<HTMLHeadingElement>>('pageTitle');

  protected readonly model = signal<SaveCategoryFormValue>({ title: '' });
  protected readonly categoryForm = form(this.model, (model) => {
    required(model.title, { message: 'Enter a category title.' });
    minLength(model.title, 2, { message: 'Use at least 2 characters.' });
    maxLength(model.title, 100, { message: 'Use no more than 100 characters.' });
  });

  protected readonly errorMessage = signal('');
  protected readonly titleError = signal('');
  protected readonly isSubmitting = signal(false);

  constructor() {
    afterNextRender(() => this.pageTitle()?.nativeElement.focus());
  }

  protected submit(event: SubmitEvent): void {
    event.preventDefault();

    const form = this.categoryForm();

    if (form.invalid()) {
      form.markAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.titleError.set('');
    this.isSubmitting.set(true);

    this.categoriesService.create(this.model()).subscribe({
      next: () => {
        void this.router.navigateByUrl('/workspace/categories');
      },
      error: (response: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.setApiErrors(response);
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

    this.errorMessage.set(problem?.detail ?? 'We could not create the category. Try again.');
  }
}
