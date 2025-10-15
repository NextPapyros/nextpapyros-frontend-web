import type { Role } from "@/types";

export interface NewEmployee {
  document: string;
  name: string;
  email: string;
  rol: Role;
}
