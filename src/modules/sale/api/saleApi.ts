import { api } from "@/services/apiClient";
import type { Product } from "../types/saleTypes";

export async function getProductsApi(search?: string): Promise<Product[]> {
  const params = search ? { q: search } : {};
  const { data } = await api.get("/products", { params });
  return data;
}
