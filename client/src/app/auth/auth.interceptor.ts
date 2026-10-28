import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';
import { API_BASE_URL } from './auth.tokens';

const publicAuthPaths = ['/auth/cadastro', '/auth/login'];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const apiBaseUrl = inject(API_BASE_URL);

  if (!isProtectedApiRequest(request.url, apiBaseUrl)) {
    return next(request);
  }

  const accessToken = inject(AuthService).session()?.accessToken;

  if (!accessToken) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );
};

function isProtectedApiRequest(requestUrl: string, apiBaseUrl: string): boolean {
  const apiUrl = new URL(apiBaseUrl || '/', window.location.origin);
  const url = new URL(requestUrl, apiUrl);

  if (url.origin !== apiUrl.origin) {
    return false;
  }

  return !publicAuthPaths.includes(url.pathname);
}
