import { api } from "@/services/apiClient";

import type { NewEmployee } from "../types/adminTypes";

export type EmployeeRoleDto = "Admin" | "Empleado";

export interface CreateEmployeePayloadDto {
  documento: string;
  nombre: string;
  email: string;
  password: string;
  rol: EmployeeRoleDto;
}

export async function createEmployeeApi(payload: NewEmployee): Promise<void> {
  const payloadDto: CreateEmployeePayloadDto = {
    documento: payload.document,
    nombre: payload.name,
    email: payload.email,
    password: "Empleado12345*",
    rol: payload.rol === "Admin" ? "Admin" : "Empleado",
  };
  const { data } = await api.post("/auth/register", payloadDto);
  return data;
}
