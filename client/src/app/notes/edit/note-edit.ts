import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  WritableSignal,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideArchive,
  LucideArrowLeft,
  LucideCheck,
  LucideFilePenLine,
  LucidePencil,
  LucideTag,
} from '@lucide/angular';

import { CategoriesService } from '../../categories/categories.service';
import { Category } from '../../categories/category.models';
import { ProblemDetails } from '../../shared/models/problem-details.model';
import { createNoteForm } from '../note-form';
import { SaveNoteFormValue, UpdateNoteFormValue } from '../note.models';
import { NotesService } from '../notes.service';

@Component({
  imports: [
    FormField,
    LucideArchive,
    LucideArrowLeft,
    LucideCheck,
    LucideFilePenLine,
    LucidePencil,
    LucideTag,
    RouterLink,
  ],
  selector: 'app-note-edit',
  templateUrl: './note-edit.html',
})
export class NoteEdit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly notesService = inject(NotesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pageTitle = viewChild<ElementRef<HTMLHeadingElement>>('pageTitle');
  private readonly noteId = this.route.snapshot.paramMap.get('noteId') ?? '';

  protected readonly categories = signal<Category[]>([]);
  protected readonly categoryError = signal('');
  protected readonly descriptionError = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isLoadingCategories = signal(true);
  protected readonly isLoadingNote = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly model = signal<UpdateNoteFormValue>({
    title: '',
    description: '',
    categoryIds: [],
    status: 'Active',
  });
  protected readonly noteForm = createNoteForm(
    this.model as unknown as WritableSignal<SaveNoteFormValue>,
  );
  protected readonly titleError = signal('');

  constructor() {
    afterNextRender(() => this.pageTitle()?.nativeElement.focus());
    this.loadCategories();
    this.loadNote();
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

  protected setStatus(status: UpdateNoteFormValue['status']): void {
    this.model.update((value) => ({ ...value, status }));
  }

  protected submit(event: SubmitEvent): void {
    event.preventDefault();

    const form = this.noteForm();

    if (form.invalid() || this.isLoadingNote()) {
      form.markAsTouched();
      return;
    }

    this.clearApiErrors();
    this.isSubmitting.set(true);

    this.notesService.update(this.noteId, this.model()).subscribe({
      next: () => {
        void this.router.navigateByUrl('/workspace/notes');
      },
      error: (response: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.setApiErrors(response);
      },
    });
  }

  private loadNote(): void {
    if (!this.noteId) {
      this.errorMessage.set('The note could not be found.');
      this.isLoadingNote.set(false);
      return;
    }

    this.notesService.getById(this.noteId).subscribe({
      next: (note) => {
        this.model.set({
          title: note.title,
          description: note.description ?? '',
          categoryIds: note.categories.map((category) => category.id),
          status: note.status,
        });
        this.isLoadingNote.set(false);
      },
      error: (response: HttpErrorResponse) => {
        const problem = response.error as ProblemDetails | null;

        this.errorMessage.set(problem?.detail ?? 'We could not load this note. Try again.');
        this.isLoadingNote.set(false);
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
      this.errorMessage.set(problem?.detail ?? 'We could not update this note. Try again.');
    }
  }
}
