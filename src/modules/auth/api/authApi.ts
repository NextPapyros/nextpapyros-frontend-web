import { api } from "@/services/apiClient";
import type { Profile } from "@/store/userStore";

import type {
  LoginRequest,
  LoginResponse,
  ProfileResponse,
} from "../types/authTypes";

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
    roles: data.roles,
  };
}
