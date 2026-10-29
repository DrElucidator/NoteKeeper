import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../auth/auth.tokens';

export interface GoogleCalendarStatus {
  isConfigured: boolean;
  isConnected: boolean;
}

interface GoogleCalendarAuthorization {
  url: string;
}

export interface GoogleCalendarSyncResult {
  eventId: string;
  eventUrl: string | null;
}

export interface GoogleCalendarBatchSyncResult {
  total: number;
  synchronized: number;
  failed: number;
}

@Injectable({ providedIn: 'root' })
export class GoogleCalendarService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = `${this.apiBaseUrl}/integrations/google-calendar`;

  getStatus(): Observable<GoogleCalendarStatus> {
    return this.http.get<GoogleCalendarStatus>(`${this.baseUrl}/status`);
  }

  getAuthorizationUrl(): Observable<GoogleCalendarAuthorization> {
    return this.http.get<GoogleCalendarAuthorization>(`${this.baseUrl}/authorization-url`);
  }

  syncNote(noteId: string): Observable<GoogleCalendarSyncResult> {
    return this.http.post<GoogleCalendarSyncResult>(`${this.baseUrl}/notes/${noteId}/sync`, {});
  }

  syncAllNotes(): Observable<GoogleCalendarBatchSyncResult> {
    return this.http.post<GoogleCalendarBatchSyncResult>(`${this.baseUrl}/notes/sync`, {});
  }

  disconnect(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/connection`);
  }
}
