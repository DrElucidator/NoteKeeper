import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, inject, signal } from '@angular/core';
import { Observable, finalize, map, tap } from 'rxjs';

import { toSession, toSignInRequest, toSignUpRequest, toUser } from './auth.mappers';
import { SessionResponse, UserResponse } from './auth.api-models';
import { Session, SignInFormValue, SignUpFormValue, User } from './auth.models';
import { API_BASE_URL, SESSION_STORAGE_KEY } from './auth.tokens';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly sessionStorageKey = inject(SESSION_STORAGE_KEY);

  private readonly sessionState = signal<Session | null>(this.readStoredSession());
  readonly session: Signal<Session | null> = this.sessionState.asReadonly();

  signUp(value: SignUpFormValue): Observable<User> {
    return this.http
      .post<UserResponse>(`${this.apiBaseUrl}/auth/cadastro`, toSignUpRequest(value))
      .pipe(map(toUser));
  }

  signIn(value: SignInFormValue): Observable<Session> {
    return this.http
      .post<SessionResponse>(`${this.apiBaseUrl}/auth/login`, toSignInRequest(value))
      .pipe(
        map(toSession),
        tap((session) => this.saveSession(session)),
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<UserResponse>(`${this.apiBaseUrl}/auth/me`).pipe(map(toUser));
  }

  signOut(): Observable<void> {
    return this.http
      .post<void>(`${this.apiBaseUrl}/auth/logout`, {})
      .pipe(finalize(() => this.clearSession()));
  }

  clearSession(): void {
    localStorage.removeItem(this.sessionStorageKey);
    this.sessionState.set(null);
  }

  private saveSession(session: Session): void {
    localStorage.setItem(this.sessionStorageKey, JSON.stringify(session));
    this.sessionState.set(session);
  }

  private readStoredSession(): Session | null {
    try {
      const serializedSession = localStorage.getItem(this.sessionStorageKey);

      if (!serializedSession) return null;

      const session = JSON.parse(serializedSession) as Partial<Session>;
      const expiration = Date.parse(session.expiresAtUtc ?? '');

      if (
        !session.userId ||
        !session.name ||
        !session.email ||
        !session.accessToken ||
        !Number.isFinite(expiration) ||
        expiration <= Date.now()
      ) {
        this.clearSession();
        return null;
      }

      return session as Session;
    } catch {
      this.clearSession();
      return null;
    }
  }
}
