import { api } from "@/services/apiClient";

import type { Product } from "@/modules/sale/types/saleTypes";

import type { NewProduct, ProductsFilters } from "../types/productTypes";

export interface CreateProductPayloadDto {
  codigo: string;
  nombre: string;
  categoria: string;
  costo: number;
  precio: number;
  stockMinimo: number;
}

type ProductsFiltersDto = {
  q?: string;
  lowStock?: true;
};

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

export async function getProducts(
  filters?: ProductsFilters
): Promise<Product[]> {
  const params: ProductsFiltersDto = {};
  if (filters?.search) params.q = filters.search;
  if (filters?.onlyLow) params.lowStock = true;
  const { data } = await api.get("/products", { params });
  return data;
}
