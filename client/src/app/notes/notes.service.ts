import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../auth/auth.tokens';
import { NoteResponse } from './notes.api-models';
import { toCreateNoteRequest, toNote, toUpdateNoteRequest } from './notes.mappers';
import { Note, SaveNoteFormValue, UpdateNoteFormValue } from './note.models';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(categoryIds: string[] = []): Observable<Note[]> {
    const uniqueCategoryIds = [...new Set(categoryIds)];
    const params = uniqueCategoryIds.reduce(
      (currentParams, categoryId) => currentParams.append('categoriaIds', categoryId),
      new HttpParams(),
    );

    return this.http
      .get<NoteResponse[]>(`${this.apiBaseUrl}/notas`, { params })
      .pipe(map((response) => response.map(toNote)));
  }

  getById(id: string): Observable<Note> {
    return this.http.get<NoteResponse>(`${this.apiBaseUrl}/notas/${id}`).pipe(map(toNote));
  }

  create(value: SaveNoteFormValue): Observable<Note> {
    return this.http
      .post<NoteResponse>(`${this.apiBaseUrl}/notas`, toCreateNoteRequest(value))
      .pipe(map(toNote));
  }

  update(id: string, value: UpdateNoteFormValue): Observable<Note> {
    return this.http
      .put<NoteResponse>(`${this.apiBaseUrl}/notas/${id}`, toUpdateNoteRequest(value))
      .pipe(map(toNote));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/notas/${id}`);
  }
}
