import { Category } from '../categories/category.models';

export type NoteStatus = 'Active' | 'Archived';

export interface Note {
  id: string;
  title: string;
  description: string | null;
  status: NoteStatus;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface SaveNoteFormValue {
  title: string;
  description: string;
  categoryIds: string[];
}

export interface UpdateNoteFormValue extends SaveNoteFormValue {
  status: NoteStatus;
}
