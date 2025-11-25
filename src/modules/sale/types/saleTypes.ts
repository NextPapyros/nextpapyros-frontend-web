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
