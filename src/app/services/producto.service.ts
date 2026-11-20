import { Injectable } from '@angular/core';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { Observable } from 'rxjs';
import { db } from '../firebase.config';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  
  private productosRef = collection(db, 'productos');

 
  obtenerProductos(): Observable<Producto[]> {
    return collectionData(this.productosRef, { idField: 'id' }) as Observable<Producto[]>;
  }

  
  async crearProducto(producto: Producto): Promise<void> {
    const datos = {
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria,
    };
    await addDoc(this.productosRef, datos);
  }

  
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

  
  async eliminarProducto(id: string): Promise<void> {
    const productoDoc = doc(db, 'productos', id);
    await deleteDoc(productoDoc);
  }
}