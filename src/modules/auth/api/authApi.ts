import { api } from "@/services/apiClient";
import type { Profile, Role } from "@/store/userStore";

import type {
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  RoleDto,
} from "../types/authTypes";

export const authAdapter = {
  dtoToRole(dto: RoleDto): Role {
    switch (dto) {
      case "Admin":
        return "Admin";
      case "Empleado":
        return "Employee";
      default:
        throw new Error(`The role ${dto} is not supported`);
    }
  },
};

export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function getProfileApi(): Promise<Profile> {
  const { data } = await api.get<ProfileResponse>("/auth/me");
  return {
    id: data.id,
    name: data.nombre,
    email: data.email,
    roles: data.roles.map(authAdapter.dtoToRole),
  };
}
