import { SignInRequest, SignUpRequest, SessionResponse, UserResponse } from './auth.api-models';
import { Session, SignInFormValue, SignUpFormValue, User } from './auth.models';

export function toSignUpRequest(value: SignUpFormValue): SignUpRequest {
  return {
    nome: value.name.trim(),
    email: value.email.trim(),
    senha: value.password,
  };
}

export function toSignInRequest(value: SignInFormValue): SignInRequest {
  return {
    email: value.email.trim(),
    senha: value.password,
  };
}

export function toUser(response: UserResponse): User {
  return {
    id: response.id,
    name: response.nome,
    email: response.email,
  };
}

export function toSession(response: SessionResponse): Session {
  return {
    userId: response.usuarioId,
    name: response.nome,
    email: response.email,
    accessToken: response.accessToken,
    expiresAtUtc: response.dataExpiracaoEmUtc,
  };
}
