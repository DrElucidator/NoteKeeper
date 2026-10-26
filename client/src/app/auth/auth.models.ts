export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Session {
  userId: string;
  name: string;
  email: string;
  accessToken: string;
  expiresAtUtc: string;
}

export interface SignUpFormValue {
  name: string;
  email: string;
  password: string;
}

export interface SignInFormValue {
  email: string;
  password: string;
}
