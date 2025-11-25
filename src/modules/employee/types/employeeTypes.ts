import type { Role } from "@/types";

export type Employee = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  role: Role;
};

export type EmployeeUpdate = {
  name: string;
  email: string;
  role: Role;
};

export const EmployeeUpdateError = {
  UNAUTHORIZED: "Unauthorized",
  INVALID_ROLE: "Invalid-Role",
  EMAIL_ALREADY_EXISTS: "Email-Already-Exists",
};
export type EmployeeUpdateError =
  (typeof EmployeeUpdateError)[keyof typeof EmployeeUpdateError];
