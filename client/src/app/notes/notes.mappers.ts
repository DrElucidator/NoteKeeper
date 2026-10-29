import { toCategory } from '../categories/categories.mappers';
import {
  CreateNoteRequest,
  NoteResponse,
  UpdateNoteRequest,
  UpdateNotePriorityRequest,
  UpdateNoteStatusRequest,
} from './notes.api-models';
import {
  Note,
  NotePriority,
  NoteStatus,
  SaveNoteFormValue,
  UpdateNoteFormValue,
} from './note.models';

export function toNote(response: NoteResponse): Note {
  return {
    id: response.id,
    title: response.titulo,
    description: response.descricao,
    dueDate: response.dataVencimento,
    status: toNoteStatus(response.status),
    priority: toNotePriority(response.prioridade),
    categories: response.categorias.map(toCategory),
    createdAt: response.criadoEm,
    updatedAt: response.atualizadoEm,
  };
}

export function toCreateNoteRequest(value: SaveNoteFormValue): CreateNoteRequest {
  return {
    titulo: value.title.trim(),
    descricao: toOptionalDescription(value.description),
    dataVencimento: toOptionalDueDate(value.dueDate),
    categoriaIds: uniqueCategoryIds(value.categoryIds),
  };
}

export function toUpdateNoteRequest(value: UpdateNoteFormValue): UpdateNoteRequest {
  return {
    ...toCreateNoteRequest(value),
    status: toApiNoteStatus(value.status),
    prioridade: toApiNotePriority(value.priority),
  };
}

export function toUpdateNoteStatusRequest(status: NoteStatus): UpdateNoteStatusRequest {
  return { status: toApiNoteStatus(status) };
}

export function toUpdateNotePriorityRequest(priority: NotePriority): UpdateNotePriorityRequest {
  return { prioridade: toApiNotePriority(priority) };
}

function toNoteStatus(status: string): NoteStatus {
  switch (status) {
    case 'Pendente':
      return 'Pending';
    case 'EmAndamento':
      return 'InProgress';
    case 'Pausada':
      return 'Paused';
    case 'Concluida':
      return 'Completed';
    case 'Arquivada':
      return 'Archived';
    default:
      throw new Error(`Unsupported note status: ${status}`);
  }
}

function toApiNoteStatus(status: NoteStatus): UpdateNoteRequest['status'] {
  switch (status) {
    case 'Pending':
      return 'Pendente';
    case 'InProgress':
      return 'EmAndamento';
    case 'Paused':
      return 'Pausada';
    case 'Completed':
      return 'Concluida';
    case 'Archived':
      return 'Arquivada';
  }
}

function toNotePriority(priority: string): NotePriority {
  switch (priority) {
    case 'Baixa':
      return 'Low';
    case 'Media':
      return 'Medium';
    case 'Alta':
      return 'High';
    case 'Urgente':
      return 'Urgent';
    default:
      throw new Error(`Unsupported note priority: ${priority}`);
  }
}

function toApiNotePriority(priority: NotePriority): UpdateNoteRequest['prioridade'] {
  switch (priority) {
    case 'Low':
      return 'Baixa';
    case 'Medium':
      return 'Media';
    case 'High':
      return 'Alta';
    case 'Urgent':
      return 'Urgente';
  }
}

function toOptionalDescription(value: string): string | null {
  const description = value.trim();

  return description || null;
}

function toOptionalDueDate(value: string): string | null {
  return value || null;
}

function uniqueCategoryIds(categoryIds: string[]): string[] {
  return [...new Set(categoryIds)];
}
