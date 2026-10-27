import { WritableSignal } from '@angular/core';
import { maxLength, minLength, form, required } from '@angular/forms/signals';

import { SaveNoteFormValue } from './note.models';

export function createNoteForm(model: WritableSignal<SaveNoteFormValue>) {
  return form(model, (value) => {
    required(value.title, { message: 'Enter a note title.' });
    minLength(value.title, 2, { message: 'Use at least 2 characters.' });
    maxLength(value.title, 100, { message: 'Use no more than 100 characters.' });
    maxLength(value.description, 300, { message: 'Use no more than 300 characters.' });
  });
}
