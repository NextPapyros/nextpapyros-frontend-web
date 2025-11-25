import { api } from "@/services/apiClient";
import { PaymentMethod, type CartItem, type Product } from "../types/saleTypes";

type SaleLineDto = {
  productoCodigo: string;
  cantidad: number;
  precioUnitario: number;
};

type NewSaleDto = {
  metodoPago: 1 | 2;
  lineas: SaleLineDto[];
};

export async function getProductsApi(search?: string): Promise<Product[]> {
  const params = search ? { q: search } : {};
  const { data } = await api.get("/products", { params });
  return data;
}

export async function registerSale(
  payment: PaymentMethod,
  items: CartItem[]
): Promise<string> {
  const lines: SaleLineDto[] = items.map((item) => ({
    productoCodigo: item.codigo,
    cantidad: item.cantidad,
    precioUnitario: item.precio,
  }));

  const dto: NewSaleDto = {
    metodoPago: payment === PaymentMethod.CASH ? 1 : 2,
    lineas: lines,
  };

  const { data } = await api.post<{ id: string }>("/ventas", dto);

  return data.id;
}
