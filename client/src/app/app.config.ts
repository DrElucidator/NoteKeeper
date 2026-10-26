import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideLucideConfig } from '@lucide/angular';

import { environment } from '../environments/environment';
import { API_BASE_URL, SESSION_STORAGE_KEY } from './auth/auth.tokens';

const routes: Routes = [];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
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
