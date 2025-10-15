import { api } from "@/services/apiClient";

import type { NewProduct } from "../types/productTypes";

export interface CreateProductPayloadDto {
  codigo: string;
  nombre: string;
  categoria: string;
  costo: number;
  precio: number;
  stockMinimo: number;
}

export async function createProductApi(payload: NewProduct): Promise<void> {
  const payloadDto: CreateProductPayloadDto = {
    codigo: payload.code,
    nombre: payload.name,
    categoria: payload.category,
    costo: payload.cost,
    precio: payload.price,
    stockMinimo: payload.minStock,
  };
  const { data } = await api.post("/products", payloadDto);
  return data;
}
