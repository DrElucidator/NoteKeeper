import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideLucideConfig } from '@lucide/angular';

import { environment } from '../environments/environment';
import { authInterceptor } from './auth/auth.interceptor';
import { authGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { API_BASE_URL, SESSION_STORAGE_KEY } from './auth/auth.tokens';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((component) => component.Home),
  },
  {
    path: 'auth',
    loadComponent: () => import('./auth/shell/auth-shell').then((component) => component.AuthShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'sign-in' },
      {
        path: 'sign-in',
        loadComponent: () => import('./auth/sign-in/sign-in').then((component) => component.SignIn),
      },
      {
        path: 'sign-up',
        loadComponent: () => import('./auth/sign-up/sign-up').then((component) => component.SignUp),
      },
    ],
  },
  {
    path: 'workspace',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./workspace/shell/workspace-shell').then((component) => component.WorkspaceShell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./workspace/home/workspace-home').then((component) => component.WorkspaceHome),
      },
      {
        path: 'categories/new',
        loadComponent: () =>
          import('./categories/create/category-create').then(
            (component) => component.CategoryCreate,
          ),
      },
      {
        path: 'categories/:categoryId/edit',
        loadComponent: () =>
          import('./categories/edit/category-edit').then((component) => component.CategoryEdit),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./categories/list/categories-list').then((component) => component.CategoriesList),
      },
      {
        path: 'notes/new',
        loadComponent: () =>
          import('./notes/create/note-create').then((component) => component.NoteCreate),
      },
      {
        path: 'notes/:noteId/edit',
        loadComponent: () =>
          import('./notes/edit/note-edit').then((component) => component.NoteEdit),
      },
      {
        path: 'notes/board',
        loadComponent: () =>
          import('./notes/board/notes-board').then((component) => component.NotesBoard),
      },
      {
        path: 'notes',
        loadComponent: () =>
          import('./notes/list/notes-list').then((component) => component.NotesList),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(() => inject(AuthService).restoreSession()),
    provideLucideConfig({ size: 20, strokeWidth: 2 }),
    {
      provide: API_BASE_URL,
      useValue: environment.apiBaseUrl,
    },
    {
      provide: SESSION_STORAGE_KEY,
      useValue: 'notekeeper.session',
    },
  ],
};
