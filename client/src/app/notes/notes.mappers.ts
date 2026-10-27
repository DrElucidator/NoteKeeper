import { toCategory } from '../categories/categories.mappers';
import { CreateNoteRequest, NoteResponse, UpdateNoteRequest } from './notes.api-models';
import { Note, NoteStatus, SaveNoteFormValue, UpdateNoteFormValue } from './note.models';

export function toNote(response: NoteResponse): Note {
  return {
    id: response.id,
    title: response.titulo,
    description: response.descricao,
    status: toNoteStatus(response.status),
    categories: response.categorias.map(toCategory),
    createdAt: response.criadoEm,
    updatedAt: response.atualizadoEm,
  };
}

export function toCreateNoteRequest(value: SaveNoteFormValue): CreateNoteRequest {
  return {
    titulo: value.title.trim(),
    descricao: toOptionalDescription(value.description),
    categoriaIds: uniqueCategoryIds(value.categoryIds),
  };
}

export function toUpdateNoteRequest(value: UpdateNoteFormValue): UpdateNoteRequest {
  return {
    ...toCreateNoteRequest(value),
    status: toApiNoteStatus(value.status),
  };
}

function toNoteStatus(status: string): NoteStatus {
  switch (status) {
    case 'Ativa':
      return 'Active';
    case 'Arquivada':
      return 'Archived';
    default:
      throw new Error(`Unsupported note status: ${status}`);
  }
}

function toApiNoteStatus(status: NoteStatus): 'Ativa' | 'Arquivada' {
  return status === 'Archived' ? 'Arquivada' : 'Ativa';
}

function toOptionalDescription(value: string): string | null {
  const description = value.trim();

  return description || null;
}

function uniqueCategoryIds(categoryIds: string[]): string[] {
  return [...new Set(categoryIds)];
}
