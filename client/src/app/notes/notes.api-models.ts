import { CategoryResponse } from '../categories/categories.api-models';

export interface NoteResponse {
  id: string;
  titulo: string;
  descricao: string | null;
  dataVencimento: string | null;
  status: string;
  prioridade: string;
  categorias: CategoryResponse[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateNoteRequest {
  titulo: string;
  descricao: string | null;
  dataVencimento: string | null;
  categoriaIds: string[];
}

export interface UpdateNoteRequest extends CreateNoteRequest {
  status: 'Pendente' | 'EmAndamento' | 'Pausada' | 'Concluida' | 'Arquivada';
  prioridade: 'Baixa' | 'Media' | 'Alta' | 'Urgente';
}

export interface UpdateNoteStatusRequest {
  status: UpdateNoteRequest['status'];
}

export interface UpdateNotePriorityRequest {
  prioridade: UpdateNoteRequest['prioridade'];
}
