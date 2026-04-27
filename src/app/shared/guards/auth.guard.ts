import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';

export const authGuard: CanActivateChildFn = async (_route, state) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (isPlatformServer(platformId)) {
    return true;
  }

  try {
    const response = await fetch('/api/auth/status', {
      credentials: 'include',
    });

    if (response.ok) {
      const payload = (await response.json()) as { authenticated?: boolean };
      if (payload.authenticated) {
        return true;
      }
    }
  } catch {
    // Fallback to login when auth status cannot be verified.
  }

  return router.createUrlTree(['/login'], {
    queryParams: { redirect: state.url },
  });
};
