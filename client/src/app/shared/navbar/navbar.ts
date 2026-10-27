import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideLogIn, LucideLogOut, LucideNotebookPen } from '@lucide/angular';

import { AuthService } from '../../auth/auth.service';

@Component({
  imports: [LucideLogIn, LucideLogOut, LucideNotebookPen, RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  templateUrl: './navbar.html',
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly session = this.authService.session;
  protected readonly isSigningOut = signal(false);

  protected signOut(): void {
    if (this.isSigningOut()) {
      return;
    }

    this.isSigningOut.set(true);

    this.authService.signOut().subscribe({
      complete: () => this.navigateToSignIn(),
      error: () => this.navigateToSignIn(),
    });
  }

  private navigateToSignIn(): void {
    void this.router.navigateByUrl('/auth/sign-in');
  }
}
