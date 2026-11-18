import { Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  // Referencia a la colección "productos" de Firestore
  private productosRef = collection(db, 'productos');

  // READ: obtiene todos los documentos de la colección
  async obtenerProductos(): Promise<Producto[]> {
    const resultado = await getDocs(this.productosRef);

    return resultado.docs.map((documento) => ({
      ...(documento.data() as Producto),
      id: documento.id,
    }));
  }

  // CREATE: registra un producto nuevo (Firestore genera el ID)
  async crearProducto(producto: Producto): Promise<void> {
    const datos = {
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria,
    };
    await addDoc(this.productosRef, datos);
  }

  // UPDATE: modifica el documento que tiene ese ID
  async actualizarProducto(id: string, producto: Producto): Promise<void> {
    const productoDoc = doc(db, 'productos', id);
    const datos = {
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria,
    };
    await updateDoc(productoDoc, datos);
  }

  // DELETE: elimina el documento que tiene ese ID
  async eliminarProducto(id: string): Promise<void> {
    const productoDoc = doc(db, 'productos', id);
    await deleteDoc(productoDoc);
  }
}