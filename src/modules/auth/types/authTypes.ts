export interface LoginRequest {
  email: string;
  password: string;
}

export type RoleDto = "Admin" | "Empleado";

export interface LoginResponse {
  token: string;
  expiresAtUtc: string;
}

export interface ProfileResponse {
  id: number;
  nombre: string;
  email: string;
  roles: RoleDto[];
}
