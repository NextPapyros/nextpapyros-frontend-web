import { api } from "@/services/apiClient";

import type { SupplierOption, NewSupplier } from "../types/supplierTypes";

const mockSuppliers: SupplierOption[] = [
  { id: "1", name: "Distribudora Papelera S.A." },
  { id: "2", name: "Suministros Escolares Ltda." },
  { id: "3", name: "Importadora Global" },
];

type SupplierDto = {
  id: string;
  nombre: string;
  nit: string;
  personaContacto: string;
  telefono: string;
  correo: string;
};

export async function getSupplierOptionsListApi(): Promise<SupplierOption[]> {
  try {
    const { data } = await api.get<SupplierDto[]>("/proveedores");

    return data.map((dto) => ({
      id: dto.id,
      name: dto.nombre,
    }));
  } catch (error) {
    return mockSuppliers;
  }
}

export async function createSupplierApi(payload: NewSupplier): Promise<void> {
  const { data } = await api.post("/proveedores", payload);
  return data;
}
