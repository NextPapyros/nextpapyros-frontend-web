export type SupplierOption = {
  id: string;
  name: string;
};

export interface NewSupplier {
  nombre: string;
  nit: string;
  personaContacto: string;
  telefono: string;
  correo: string;
}
