import { api } from "@/services/apiClient";

import type { Product } from "@/modules/sale/types/saleTypes";

import type {
  NewProduct,
  ProductsFilters,
  ProductUpdate,
} from "../types/productTypes";

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
  includeInactive?: true;
};

type ProductUpdateDto = {
  nombre: string;
  categoria: string;
  costo: number;
  precio: number;
  stockMinimo: number;
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
  if (filters?.includeInactive) params.includeInactive = true;

  const { data } = await api.get("/products", { params });
  return data;
}

export async function getProductByCode(code: string): Promise<Product> {
  const { data } = await api.get(`/products/${code}`);
  return data;
}

export async function deactivateProduct(code: string): Promise<void> {
  await api.delete(`/products/${code}`);
}

export async function reactivateProduct(code: string): Promise<void> {
  await api.post(`/products/${code}/reactivate`);
}

export async function updateProduct(
  code: string,
  payload: ProductUpdate
): Promise<void> {
  const dto: ProductUpdateDto = {
    nombre: payload.name,
    categoria: payload.category,
    costo: payload.cost,
    precio: payload.price,
    stockMinimo: payload.minStock,
  };

  await api.put(`/products/${code}`, dto);
}
