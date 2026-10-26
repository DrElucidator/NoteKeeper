export interface SignUpRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface SignInRequest {
  email: string;
  senha: string;
}

export interface UserResponse {
  id: string;
  nome: string;
  email: string;
}

export interface SessionResponse {
  usuarioId: string;
  nome: string;
  email: string;
  accessToken: string;
  dataExpiracaoEmUtc: string;
}
