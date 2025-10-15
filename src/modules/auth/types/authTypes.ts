export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAtUtc: string;
}

export interface ProfileResponse {
  id: number;
  nombre: string;
  email: string;
  roles: Role[];
}

export type Role = "Admin" | "Employee";
