import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LucideLogOut, LucideNotebookPen } from '@lucide/angular';

import { AuthService } from '../../auth/auth.service';

@Component({
  imports: [LucideLogOut, LucideNotebookPen, RouterLink, RouterOutlet],
  selector: 'app-workspace-shell',
  templateUrl: './workspace-shell.html',
})
export class WorkspaceShell {
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
