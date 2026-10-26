import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);

  if (authService.hasValidSession()) {
    return true;
  }

  return inject(Router).createUrlTree(['/auth/login'], {
    queryParams: { redirectTo: state.url },
  });
};
