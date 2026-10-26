import { Component, inject } from '@angular/core';
import { LucideLayoutDashboard, LucideStickyNote, LucideTags } from '@lucide/angular';

import { AuthService } from '../../auth/auth.service';

@Component({
  imports: [LucideLayoutDashboard, LucideStickyNote, LucideTags],
  selector: 'app-workspace-home',
  templateUrl: './workspace-home.html',
})
export class WorkspaceHome {
  protected readonly session = inject(AuthService).session;
}
