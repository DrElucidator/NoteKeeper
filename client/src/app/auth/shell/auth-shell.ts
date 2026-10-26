import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LucideLockKeyhole, LucideNotebookPen } from '@lucide/angular';

@Component({
  imports: [LucideLockKeyhole, LucideNotebookPen, RouterLink, RouterOutlet],
  selector: 'app-auth-shell',
  templateUrl: './auth-shell.html',
})
export class AuthShell {}
