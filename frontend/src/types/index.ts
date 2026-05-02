export type UserRole = "dador" | "transportista" | "admin";
export type UserStatus =
  | "pendiente_verificacion"
  | "verificado"
  | "suspendido"
  | "rechazado";

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  rol: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  email_verificado: boolean;
  telefono_verificado: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}
