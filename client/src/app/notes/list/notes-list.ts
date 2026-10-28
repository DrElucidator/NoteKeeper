import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideAlertTriangle,
  LucideArchive,
  LucideFileText,
  LucideFilter,
  LucideCircleCheckBig,
  LucideListTodo,
  LucideLoaderCircle,
  LucidePencil,
  LucideRefreshCw,
  LucideSearch,
  LucideTag,
  LucideTrash2,
  LucideX,
} from '@lucide/angular';

import { CategoriesService } from '../../categories/categories.service';
import { Category } from '../../categories/category.models';
import { ProblemDetails } from '../../shared/models/problem-details.model';
import { Note } from '../note.models';
import { NotesService } from '../notes.service';

@Component({
  imports: [
    DatePipe,
    LucideAlertCircle,
    LucideAlertTriangle,
    LucideArchive,
    LucideCircleCheckBig,
    LucideFileText,
    LucideFilter,
    LucideListTodo,
    LucideLoaderCircle,
    LucidePencil,
    LucideRefreshCw,
    LucideSearch,
    LucideTag,
    LucideTrash2,
    LucideX,
    RouterLink,
  ],
  selector: 'app-notes-list',
  templateUrl: './notes-list.html',
})
export class NotesList {
  private readonly categoriesService = inject(CategoriesService);
  private readonly notesService = inject(NotesService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly deleteError = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isDeleting = signal(false);
  protected readonly isLoading = signal(true);
  protected readonly notes = signal<Note[]>([]);
  protected readonly notePendingDeletion = signal<Note | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly selectedCategoryIds = signal<string[]>([]);
  protected readonly successMessage = signal('');
  protected readonly visibleNotes = computed(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase();

    if (!query) {
      return this.notes();
    }

    return this.notes().filter((note) => note.title.toLocaleLowerCase().includes(query));
  });

  constructor() {
    this.loadCategories();
    this.loadNotes();
  }

  protected updateSearch(query: string): void {
    this.searchQuery.set(query);
  }

  protected toggleCategory(categoryId: string): void {
    this.selectedCategoryIds.update((categoryIds) =>
      categoryIds.includes(categoryId)
        ? categoryIds.filter((currentCategoryId) => currentCategoryId !== categoryId)
        : [...categoryIds, categoryId],
    );
    this.loadNotes();
  }

  protected clearFilters(): void {
    if (!this.searchQuery() && this.selectedCategoryIds().length === 0) {
      return;
    }

    this.searchQuery.set('');
    this.selectedCategoryIds.set([]);
    this.loadNotes();
  }

  protected isCategorySelected(categoryId: string): boolean {
    return this.selectedCategoryIds().includes(categoryId);
  }

  protected retry(): void {
    this.loadCategories();
    this.loadNotes();
  }

  protected requestDeletion(note: Note): void {
    this.notePendingDeletion.set(note);
    this.deleteError.set('');
  }

  protected cancelDeletion(): void {
    if (this.isDeleting()) {
      return;
    }

    this.notePendingDeletion.set(null);
    this.deleteError.set('');
  }

  protected confirmDeletion(): void {
    const note = this.notePendingDeletion();

    if (!note || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.deleteError.set('');

    this.notesService.delete(note.id).subscribe({
      next: () => {
        this.notes.update((notes) => notes.filter((currentNote) => currentNote.id !== note.id));
        this.notePendingDeletion.set(null);
        this.successMessage.set(`Note "${note.title}" was deleted.`);
        this.isDeleting.set(false);
      },
      error: (response: HttpErrorResponse) => {
        const problem = response.error as ProblemDetails | null;

        this.deleteError.set(problem?.detail ?? 'We could not delete this note. Try again.');
        this.isDeleting.set(false);
      },
    });
  }

  private loadCategories(): void {
    this.categoriesService.list().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (response: HttpErrorResponse) => this.handleError(response),
    });
  }

  private loadNotes(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.notesService.list(this.selectedCategoryIds()).subscribe({
      next: (notes) => {
        this.notes.set(notes);
        this.isLoading.set(false);
      },
      error: (response: HttpErrorResponse) => {
        this.handleError(response);
        this.isLoading.set(false);
      },
    });
  }

  private handleError(response: HttpErrorResponse): void {
    const problem = response.error as ProblemDetails | null;

    this.errorMessage.set(problem?.detail ?? 'We could not load your notes. Try again.');
  }
}
