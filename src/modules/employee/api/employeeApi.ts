import type { EmployeeRoleDto } from "@/modules/admin/api/employeeApi";
import { api } from "@/services/apiClient";
import { Role } from "@/types";

import type { Employee } from "../types/employeeTypes";

type EmployeeDto = {
  id: string;
  activo: boolean;
  email: string;
  nombre: string;
  role: EmployeeRoleDto;
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
