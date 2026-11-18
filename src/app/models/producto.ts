// Modelo de un documento de la colección "productos" en Firestore
export interface Producto {
  id?: string;       // ID del documento (ej: "producto1"). Opcional al crear.
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}