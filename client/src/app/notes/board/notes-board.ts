import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import {
  LucideAlertCircle,
  LucideCircleCheckBig,
  LucideCirclePause,
  LucideChevronDown,
  LucideColumns3,
  LucideFileText,
  LucideFlag,
  LucideLayoutList,
  LucideListTodo,
  LucideLoaderCircle,
  LucidePlus,
  LucidePencil,
  LucideRefreshCw,
  LucideTag,
} from '@lucide/angular';

import { ProblemDetails } from '../../shared/models/problem-details.model';
import { Note, NotePriority, NoteStatus } from '../note.models';
import { NotesService } from '../notes.service';

interface KanbanColumn {
  status: Exclude<NoteStatus, 'Archived'>;
  title: string;
  description: string;
  theme: string;
}

type ActiveNoteStatus = Exclude<NoteStatus, 'Archived'>;

@Component({
  imports: [
    CdkDrag,
    CdkDropList,
    DatePipe,
    LucideAlertCircle,
    LucideCircleCheckBig,
    LucideCirclePause,
    LucideChevronDown,
    LucideColumns3,
    LucideFileText,
    LucideFlag,
    LucideLayoutList,
    LucideListTodo,
    LucideLoaderCircle,
    LucidePlus,
    LucidePencil,
    LucideRefreshCw,
    LucideTag,
    RouterLink,
  ],
  selector: 'app-notes-board',
  templateUrl: './notes-board.html',
})
export class NotesBoard {
  private readonly notesService = inject(NotesService);

  protected readonly columns: readonly KanbanColumn[] = [
    {
      status: 'Pending',
      title: 'Pending',
      description: 'Ready to begin',
      theme: 'border-indigo-200 bg-indigo-50/50',
    },
    {
      status: 'InProgress',
      title: 'In progress',
      description: 'Currently underway',
      theme: 'border-amber-200 bg-amber-50/50',
    },
    {
      status: 'Paused',
      title: 'Paused',
      description: 'Temporarily on hold',
      theme: 'border-violet-200 bg-violet-50/50',
    },
    {
      status: 'Completed',
      title: 'Completed',
      description: 'Finished work',
      theme: 'border-emerald-200 bg-emerald-50/50',
    },
  ];
  protected readonly errorMessage = signal('');
  protected readonly dropListIds = this.columns.map((column) => `notes-board-${column.status}`);
  protected readonly activeDropStatus = signal<ActiveNoteStatus | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isUpdatingPriorityId = signal<string | null>(null);
  protected readonly isUpdatingStatusId = signal<string | null>(null);
  protected readonly notes = signal<Note[]>([]);
  protected readonly notePriorities: readonly NotePriority[] = ['Low', 'Medium', 'High', 'Urgent'];
  protected readonly priorityMenuNoteId = signal<string | null>(null);
  protected readonly statusMenuNoteId = signal<string | null>(null);
  protected readonly successMessage = signal('');
  protected readonly visibleColumns = computed(() =>
    this.columns.map((column) => ({
      ...column,
      notes: this.notes()
        .filter((note) => note.status === column.status)
        .sort((left, right) => this.priorityRank(right.priority) - this.priorityRank(left.priority)),
    })),
  );

  constructor() {
    this.loadNotes();
  }

  protected changeStatus(note: Note, status: NoteStatus): void {
    if (note.status === status || this.isUpdatingStatusId()) {
      this.statusMenuNoteId.set(null);
      return;
    }

    this.isUpdatingStatusId.set(note.id);
    this.statusMenuNoteId.set(null);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.notesService.updateStatus(note.id, status).subscribe({
      next: (updatedNote) => {
        this.notes.update((notes) =>
          notes.map((currentNote) => (currentNote.id === updatedNote.id ? updatedNote : currentNote)),
        );
        this.successMessage.set(`Status for "${updatedNote.title}" was updated.`);
        this.isUpdatingStatusId.set(null);
      },
      error: (response: HttpErrorResponse) => {
        const problem = response.error as ProblemDetails | null;

        this.errorMessage.set(problem?.detail ?? 'We could not update the note status. Try again.');
        this.isUpdatingStatusId.set(null);
      },
    });
  }

  protected changePriority(note: Note, priority: NotePriority): void {
    if (note.priority === priority || this.isUpdatingPriorityId()) {
      this.priorityMenuNoteId.set(null);
      return;
    }

    this.isUpdatingPriorityId.set(note.id);
    this.priorityMenuNoteId.set(null);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.notesService.updatePriority(note.id, priority).subscribe({
      next: (updatedNote) => {
        this.notes.update((notes) =>
          notes.map((currentNote) => (currentNote.id === updatedNote.id ? updatedNote : currentNote)),
        );
        this.successMessage.set(`Priority for "${updatedNote.title}" was updated.`);
        this.isUpdatingPriorityId.set(null);
      },
      error: (response: HttpErrorResponse) => {
        const problem = response.error as ProblemDetails | null;

        this.errorMessage.set(problem?.detail ?? 'We could not update the note priority. Try again.');
        this.isUpdatingPriorityId.set(null);
      },
    });
  }

  protected moveToColumn(event: CdkDragDrop<Note[]>, status: ActiveNoteStatus): void {
    this.activeDropStatus.set(null);

    if (event.previousContainer === event.container) {
      return;
    }

    const note = event.item.data as Note;

    this.changeStatus(note, status);
  }

  protected setActiveDropTarget(status: ActiveNoteStatus | null): void {
    this.activeDropStatus.set(status);
  }

  protected toggleStatusMenu(noteId: string): void {
    this.priorityMenuNoteId.set(null);
    this.statusMenuNoteId.update((currentNoteId) =>
      currentNoteId === noteId ? null : noteId,
    );
  }

  protected togglePriorityMenu(noteId: string): void {
    this.statusMenuNoteId.set(null);
    this.priorityMenuNoteId.update((currentNoteId) =>
      currentNoteId === noteId ? null : noteId,
    );
  }

  protected retry(): void {
    this.loadNotes();
  }

  private loadNotes(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.notesService.list().subscribe({
      next: (notes) => {
        this.notes.set(notes);
        this.isLoading.set(false);
      },
      error: (response: HttpErrorResponse) => {
        const problem = response.error as ProblemDetails | null;

        this.errorMessage.set(problem?.detail ?? 'We could not load your notes. Try again.');
        this.isLoading.set(false);
      },
    });
  }

  private priorityRank(priority: NotePriority): number {
    switch (priority) {
      case 'Urgent':
        return 4;
      case 'High':
        return 3;
      case 'Medium':
        return 2;
      case 'Low':
        return 1;
    }
  }
}
