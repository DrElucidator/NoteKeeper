import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideLucideConfig } from '@lucide/angular';

import { environment } from '../environments/environment';
import { authInterceptor } from './auth/auth.interceptor';
import { API_BASE_URL, SESSION_STORAGE_KEY } from './auth/auth.tokens';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/sign-in' },
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
  { path: '**', redirectTo: 'auth/sign-in' },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
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
