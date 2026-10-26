import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { FormField, email, form, minLength, pattern, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { LucideCheckCircle2, LucideUserPlus } from '@lucide/angular';

import { SignUpFormValue } from '../auth.models';
import { AuthService } from '../auth.service';
import { ProblemDetails } from '../../shared/models/problem-details.model';

@Component({
  imports: [FormField, LucideCheckCircle2, LucideUserPlus, RouterLink],
  selector: 'app-sign-up',
  templateUrl: './sign-up.html',
})
export class SignUp {
  private readonly authService = inject(AuthService);
  private readonly pageTitle = viewChild<ElementRef<HTMLHeadingElement>>('pageTitle');

  protected readonly model = signal<SignUpFormValue>({ name: '', email: '', password: '' });
  protected readonly signUpForm = form(this.model, (model) => {
    required(model.name, { message: 'Enter your name.' });
    required(model.email, { message: 'Enter your email address.' });
    email(model.email, { message: 'Enter a valid email address.' });
    required(model.password, { message: 'Create a password.' });
    minLength(model.password, 8, { message: 'Use at least 8 characters.' });
    pattern(model.password, /(?=.*\d)(?=.*[^a-zA-Z0-9]).+/, {
      message: 'Include at least one number and one special character.',
    });
  });

  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isSubmitting = signal(false);

  constructor() {
    afterNextRender(() => this.pageTitle()?.nativeElement.focus());
  }

  protected submit(event: SubmitEvent): void {
    event.preventDefault();

    const form = this.signUpForm();

    if (form.invalid()) {
      form.markAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSubmitting.set(true);

    this.authService.signUp(this.model()).subscribe({
      next: (user) => {
        this.isSubmitting.set(false);
        this.successMessage.set(`Account created for ${user.name}.`);
        this.model.set({ name: '', email: '', password: '' });
      },
      error: (response: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(this.getErrorMessage(response));
      },
    });
  }

  private getErrorMessage(response: HttpErrorResponse): string {
    if (response.status === 409) {
      return 'An account with this email already exists.';
    }

    const problem = response.error as ProblemDetails | null;
    const validationMessages = Object.values(problem?.errors ?? {}).flat();

    return (
      validationMessages[0] ?? problem?.detail ?? 'We could not create your account. Try again.'
    );
  }
}
