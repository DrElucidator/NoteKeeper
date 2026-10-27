import { WritableSignal } from '@angular/core';
import { maxLength, minLength, form, required } from '@angular/forms/signals';

import { SaveCategoryFormValue } from './category.models';

export function createCategoryForm(model: WritableSignal<SaveCategoryFormValue>) {
  return form(model, (value) => {
    required(value.title, { message: 'Enter a category title.' });
    minLength(value.title, 2, { message: 'Use at least 2 characters.' });
    maxLength(value.title, 100, { message: 'Use no more than 100 characters.' });
  });
}
