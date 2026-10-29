import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideCalendarDays,
  LucideCalendarSync,
  LucideChevronLeft,
  LucideChevronRight,
  LucideColumns3,
  LucideLayoutList,
  LucidePlus,
  LucideRefreshCw,
  LucideUnlink,
} from '@lucide/angular';

import { ProblemDetails } from '../../shared/models/problem-details.model';
import { Note } from '../note.models';
import { GoogleCalendarService, GoogleCalendarStatus } from '../google-calendar.service';
import { NotesService } from '../notes.service';

interface CalendarDay {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
}

@Component({
  imports: [
    LucideAlertCircle,
    LucideCalendarDays,
    LucideCalendarSync,
    LucideChevronLeft,
    LucideChevronRight,
    LucideColumns3,
    LucideLayoutList,
    LucidePlus,
    LucideRefreshCw,
    LucideUnlink,
    RouterLink,
  ],
  selector: 'app-notes-calendar',
  templateUrl: './notes-calendar.html',
})
export class NotesCalendar {
  private readonly googleCalendarService = inject(GoogleCalendarService);
  private readonly notesService = inject(NotesService);

  protected readonly currentMonth = signal(startOfMonth(new Date()));
  protected readonly errorMessage = signal('');
  protected readonly googleCalendarMessage = signal('');
  protected readonly googleCalendarStatus = signal<GoogleCalendarStatus | null>(null);
  protected readonly isGoogleCalendarAction = signal(false);
  protected readonly isLoading = signal(true);
  protected readonly notes = signal<Note[]>([]);
  protected readonly selectedDate = signal(toIsoDate(new Date()));
  protected readonly weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  protected readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
      this.currentMonth(),
    ),
  );
  protected readonly calendarDays = computed(() => createCalendarDays(this.currentMonth()));
  protected readonly selectedDayLabel = computed(() =>
    new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(toDateFromIso(this.selectedDate())),
  );
  protected readonly notesByDate = computed(() => {
    const groupedNotes = new Map<string, Note[]>();

    for (const note of this.notes()) {
      if (!note.dueDate) {
        continue;
      }

      const notesForDate = groupedNotes.get(note.dueDate) ?? [];
      groupedNotes.set(note.dueDate, [...notesForDate, note]);
    }

    return groupedNotes;
  });
  protected readonly selectedNotes = computed(() => this.notesForDate(this.selectedDate()));

  constructor() {
    this.loadNotes();
    this.loadGoogleCalendarStatus();
  }

  protected notesForDate(date: string): readonly Note[] {
    return this.notesByDate().get(date) ?? [];
  }

  protected nextMonth(): void {
    this.changeMonth(1);
  }

  protected previousMonth(): void {
    this.changeMonth(-1);
  }

  protected retry(): void {
    this.loadNotes();
  }

  protected selectDate(date: string): void {
    this.selectedDate.set(date);
  }

  protected goToToday(): void {
    const today = new Date();

    this.currentMonth.set(startOfMonth(today));
    this.selectedDate.set(toIsoDate(today));
  }

  protected connectGoogleCalendar(): void {
    this.isGoogleCalendarAction.set(true);
    this.googleCalendarMessage.set('');

    this.googleCalendarService.getAuthorizationUrl().subscribe({
      next: ({ url }) => window.location.assign(url),
      error: (response: HttpErrorResponse) => {
        this.googleCalendarMessage.set(getErrorMessage(response, 'Google Calendar could not start the connection.'));
        this.isGoogleCalendarAction.set(false);
      },
    });
  }

  protected disconnectGoogleCalendar(): void {
    this.isGoogleCalendarAction.set(true);
    this.googleCalendarMessage.set('');

    this.googleCalendarService.disconnect().subscribe({
      next: () => {
        this.googleCalendarStatus.set({ isConfigured: true, isConnected: false });
        this.googleCalendarMessage.set('Google Calendar was disconnected.');
        this.isGoogleCalendarAction.set(false);
      },
      error: (response: HttpErrorResponse) => {
        this.googleCalendarMessage.set(getErrorMessage(response, 'Google Calendar could not be disconnected.'));
        this.isGoogleCalendarAction.set(false);
      },
    });
  }

  protected syncNoteToGoogleCalendar(note: Note): void {
    this.isGoogleCalendarAction.set(true);
    this.googleCalendarMessage.set('');

    this.googleCalendarService.syncNote(note.id).subscribe({
      next: () => {
        this.googleCalendarMessage.set(`"${note.title}" is synchronized with Google Calendar.`);
        this.isGoogleCalendarAction.set(false);
      },
      error: (response: HttpErrorResponse) => {
        this.googleCalendarMessage.set(getErrorMessage(response, 'This note could not be synchronized.'));
        this.isGoogleCalendarAction.set(false);
      },
    });
  }

  protected syncAllNotesToGoogleCalendar(): void {
    this.isGoogleCalendarAction.set(true);
    this.googleCalendarMessage.set('');

    this.googleCalendarService.syncAllNotes().subscribe({
      next: (result) => {
        const failedMessage = result.failed > 0 ? ` ${result.failed} could not be synchronized.` : '';
        this.googleCalendarMessage.set(`${result.synchronized} of ${result.total} notes with due dates were synchronized.${failedMessage}`);
        this.isGoogleCalendarAction.set(false);
      },
      error: (response: HttpErrorResponse) => {
        this.googleCalendarMessage.set(getErrorMessage(response, 'Your notes could not be synchronized.'));
        this.isGoogleCalendarAction.set(false);
      },
    });
  }

  protected statusClass(status: Note['status']): string {
    switch (status) {
      case 'Pending':
        return 'bg-indigo-100 text-indigo-800';
      case 'InProgress':
        return 'bg-amber-100 text-amber-900';
      case 'Paused':
        return 'bg-violet-100 text-violet-800';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'Archived':
        return 'bg-slate-200 text-slate-700';
    }
  }

  protected isToday(date: string): boolean {
    return date === toIsoDate(new Date());
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

  private loadGoogleCalendarStatus(): void {
    this.googleCalendarService.getStatus().subscribe({
      next: (status) => this.googleCalendarStatus.set(status),
      error: () => this.googleCalendarStatus.set(null),
    });
  }

  private changeMonth(offset: number): void {
    const nextMonth = new Date(
      this.currentMonth().getFullYear(),
      this.currentMonth().getMonth() + offset,
      1,
    );

    this.currentMonth.set(nextMonth);
    this.selectedDate.set(toIsoDate(nextMonth));
  }
}

function getErrorMessage(response: HttpErrorResponse, fallback: string): string {
  const problem = response.error as ProblemDetails | null;

  return problem?.detail ?? problem?.title ?? fallback;
}

function createCalendarDays(month: Date): CalendarDay[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(month.getFullYear(), month.getMonth(), 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);

    return {
      date: toIsoDate(date),
      dayOfMonth: date.getDate(),
      isCurrentMonth: date.getMonth() === month.getMonth(),
    };
  });
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toDateFromIso(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day);
}
