import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from '../../shared/navbar/navbar';

@Component({
  imports: [Navbar, RouterOutlet],
  selector: 'app-workspace-shell',
  templateUrl: './workspace-shell.html',
})
export class WorkspaceShell {}
