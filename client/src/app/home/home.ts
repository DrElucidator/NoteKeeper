import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideCheck, LucideLockKeyhole, LucidePlus } from '@lucide/angular';

import { AuthService } from '../auth/auth.service';
import { Navbar } from '../shared/navbar/navbar';

@Component({
  imports: [LucideArrowRight, LucideCheck, LucideLockKeyhole, LucidePlus, Navbar, RouterLink],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  protected readonly session = inject(AuthService).session;
}
