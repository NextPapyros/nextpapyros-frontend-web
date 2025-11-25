import type { Role } from "@/types";

export type Employee = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  role: Role;
};
