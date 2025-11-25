export interface Product {
  codigo: string;
  nombre: string;
  categoria: string;
  costo: number;
  precio: number;
  stock: number;
  stockMinimo: number;
  activo: boolean;
}

export interface CartItem {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stockDisponible: number;
}

export interface SaleData {
  productos: CartItem[];
  total: number;
  fecha: string;
}

export const PaymentMethod = {
  CASH: "cash",
  CREDIT_CARD: "credit-card",
};
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
