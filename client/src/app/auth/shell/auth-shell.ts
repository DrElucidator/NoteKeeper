import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideNotebookPen } from '@lucide/angular';

@Component({
  imports: [LucideNotebookPen, RouterOutlet],
  selector: 'app-auth-shell',
  templateUrl: './auth-shell.html',
})
export class AuthShell {}
