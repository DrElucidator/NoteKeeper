import { CategoryResponse } from '../categories/categories.api-models';

export interface NoteResponse {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string;
  categorias: CategoryResponse[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateNoteRequest {
  titulo: string;
  descricao: string | null;
  categoriaIds: string[];
}

export interface UpdateNoteRequest extends CreateNoteRequest {
  status: 'Pendente' | 'EmAndamento' | 'Concluida' | 'Arquivada';
}

export interface UpdateNoteStatusRequest {
  status: UpdateNoteRequest['status'];
}
