export interface NewProduct {
  code: string;
  name: string;
  category: string;
  supplier: string;
  cost: number;
  price: number;
  minStock: number;
}

export type ProductsFilters = {
  search?: string;
  onlyLow?: boolean;
};
