import { AxiosError } from "axios";

import type { EmployeeRoleDto } from "@/modules/admin/api/employeeApi";
import { api } from "@/services/apiClient";
import { Role } from "@/types";

import {
  EmployeeUpdateError,
  type Employee,
  type EmployeeUpdate,
} from "../types/employeeTypes";

type EmployeeDto = {
  id: string;
  activo: boolean;
  email: string;
  nombre: string;
  role: EmployeeRoleDto;
};

type EmployeUpdateDto = {
  nombre: string;
  email: string;
  rol: EmployeeRoleDto;
};

export const getAllEmployees = async (): Promise<Employee[]> => {
  const { data } = await api.get<EmployeeDto[]>("/empleados");

  return data.map((employee) => ({
    id: employee.id.toString(),
    name: employee.nombre,
    email: employee.email,
    active: employee.activo,
    role: employee.role === "Admin" ? Role.Admin : Role.Employee,
  }));
};

export const deactivateEmployee = async (id: string): Promise<void> => {
  await api.patch(`/empleados/${id}/inhabilitar`);
};

export const updateEmployee = async (
  id: string,
  data: EmployeeUpdate
): Promise<void | EmployeeUpdateError> => {
  try {
    const dto: EmployeUpdateDto = {
      nombre: data.name,
      email: data.email,
      rol: data.role === Role.Admin ? "Admin" : "Empleado",
    };
    await api.put(`/empleados/${id}`, dto);
  } catch (error) {
    const isAxiosError = error instanceof AxiosError;
    if (!isAxiosError) throw error;

    const status = error.response?.status;
    if (status === 401) return EmployeeUpdateError.UNAUTHORIZED;
    if (status === 404) return EmployeeUpdateError.INVALID_ROLE;
    if (status === 409) return EmployeeUpdateError.EMAIL_ALREADY_EXISTS;

    throw error;
  }
};

export const getEmployeeById = async (id: string): Promise<Employee> => {
  const { data } = await api.get<EmployeeDto>(`/empleados/${id}`);

  return {
    id: data.id.toString(),
    name: data.nombre,
    email: data.email,
    active: data.activo,
    role: data.role === "Admin" ? Role.Admin : Role.Employee,
  };
};
