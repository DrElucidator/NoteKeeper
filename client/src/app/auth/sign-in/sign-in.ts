import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { FormField, email, form, minLength, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { LucideCheckCircle2, LucideLogIn } from '@lucide/angular';

import { ProblemDetails } from '../../shared/models/problem-details.model';
import { SignInFormValue } from '../auth.models';
import { AuthService } from '../auth.service';

@Component({
  imports: [FormField, LucideCheckCircle2, LucideLogIn, RouterLink],
  selector: 'app-sign-in',
  templateUrl: './sign-in.html',
})
export class SignIn {
  private readonly authService = inject(AuthService);
  private readonly pageTitle = viewChild<ElementRef<HTMLHeadingElement>>('pageTitle');

  protected readonly model = signal<SignInFormValue>({ email: '', password: '' });
  protected readonly signInForm = form(this.model, (model) => {
    required(model.email, { message: 'Enter your email address.' });
    email(model.email, { message: 'Enter a valid email address.' });
    required(model.password, { message: 'Enter your password.' });
    minLength(model.password, 8, { message: 'Use at least 8 characters.' });
  });

  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isSubmitting = signal(false);

  constructor() {
    afterNextRender(() => this.pageTitle()?.nativeElement.focus());
  }

  protected submit(event: SubmitEvent): void {
    event.preventDefault();

    const form = this.signInForm();

    if (form.invalid()) {
      form.markAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSubmitting.set(true);

    this.authService.signIn(this.model()).subscribe({
      next: (session) => {
        this.isSubmitting.set(false);
        this.successMessage.set(`Welcome back, ${session.name}.`);
      },
      error: (response: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(this.getErrorMessage(response));
      },
    });
  }

  private getErrorMessage(response: HttpErrorResponse): string {
    if (response.status === 401) {
      return 'Email or password is incorrect.';
    }

    const problem = response.error as ProblemDetails | null;

    return problem?.detail ?? 'We could not sign you in. Try again.';
  }
}
