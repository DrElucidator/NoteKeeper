import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideLayoutDashboard, LucideStickyNote, LucideTags } from '@lucide/angular';

import { AuthService } from '../../auth/auth.service';

@Component({
  imports: [LucideLayoutDashboard, LucideStickyNote, LucideTags, RouterLink],
  selector: 'app-workspace-home',
  templateUrl: './workspace-home.html',
})
export class WorkspaceHome {
  protected readonly session = inject(AuthService).session;
}
