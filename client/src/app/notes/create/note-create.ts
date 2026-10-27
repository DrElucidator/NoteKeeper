import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideCheck,
  LucideFilePlus2,
  LucidePlus,
  LucideTag,
} from '@lucide/angular';

import { CategoriesService } from '../../categories/categories.service';
import { Category } from '../../categories/category.models';
import { ProblemDetails } from '../../shared/models/problem-details.model';
import { createNoteForm } from '../note-form';
import { SaveNoteFormValue } from '../note.models';
import { NotesService } from '../notes.service';

@Component({
  imports: [
    FormField,
    LucideArrowLeft,
    LucideCheck,
    LucideFilePlus2,
    LucidePlus,
    LucideTag,
    RouterLink,
  ],
  selector: 'app-note-create',
  templateUrl: './note-create.html',
})
export class NoteCreate {
  private readonly categoriesService = inject(CategoriesService);
  private readonly notesService = inject(NotesService);
  private readonly router = inject(Router);
  private readonly pageTitle = viewChild<ElementRef<HTMLHeadingElement>>('pageTitle');

  protected readonly categories = signal<Category[]>([]);
  protected readonly categoryError = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isLoadingCategories = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly model = signal<SaveNoteFormValue>({
    title: '',
    description: '',
    categoryIds: [],
  });
  protected readonly noteForm = createNoteForm(this.model);
  protected readonly titleError = signal('');
  protected readonly descriptionError = signal('');

  constructor() {
    afterNextRender(() => this.pageTitle()?.nativeElement.focus());
    this.loadCategories();
  }

  protected toggleCategory(categoryId: string): void {
    this.model.update((value) => ({
      ...value,
      categoryIds: value.categoryIds.includes(categoryId)
        ? value.categoryIds.filter((currentCategoryId) => currentCategoryId !== categoryId)
        : [...value.categoryIds, categoryId],
    }));
  }

  protected isCategorySelected(categoryId: string): boolean {
    return this.model().categoryIds.includes(categoryId);
  }

  protected submit(event: SubmitEvent): void {
    event.preventDefault();

    const form = this.noteForm();

    if (form.invalid()) {
      form.markAsTouched();
      return;
    }

    this.clearApiErrors();
    this.isSubmitting.set(true);

    this.notesService.create(this.model()).subscribe({
      next: () => {
        void this.router.navigateByUrl('/workspace/notes');
      },
      error: (response: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.setApiErrors(response);
      },
    });
  }

  private loadCategories(): void {
    this.categoriesService.list().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoadingCategories.set(false);
      },
      error: (response: HttpErrorResponse) => {
        const problem = response.error as ProblemDetails | null;

        this.categoryError.set(problem?.detail ?? 'We could not load your categories. Try again.');
        this.isLoadingCategories.set(false);
      },
    });
  }

  private clearApiErrors(): void {
    this.errorMessage.set('');
    this.titleError.set('');
    this.descriptionError.set('');
  }

  private setApiErrors(response: HttpErrorResponse): void {
    const problem = response.error as ProblemDetails | null;
    const titleError = problem?.errors?.['titulo']?.[0];
    const descriptionError = problem?.errors?.['descricao']?.[0];

    if (titleError) {
      this.titleError.set(titleError);
    }

    if (descriptionError) {
      this.descriptionError.set(descriptionError);
    }

    if (!titleError && !descriptionError) {
      this.errorMessage.set(problem?.detail ?? 'We could not create this note. Try again.');
    }
  }
}
