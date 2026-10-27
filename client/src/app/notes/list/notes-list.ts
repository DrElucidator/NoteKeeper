import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideArchive,
  LucideFileText,
  LucideFilter,
  LucidePencil,
  LucideRefreshCw,
  LucideSearch,
  LucideTag,
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
    LucideArchive,
    LucideFileText,
    LucideFilter,
    LucidePencil,
    LucideRefreshCw,
    LucideSearch,
    LucideTag,
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
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(true);
  protected readonly notes = signal<Note[]>([]);
  protected readonly searchQuery = signal('');
  protected readonly selectedCategoryIds = signal<string[]>([]);
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

  private loadCategories(): void {
    this.categoriesService.list().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (response: HttpErrorResponse) => this.handleError(response),
    });
  }

  private loadNotes(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

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
