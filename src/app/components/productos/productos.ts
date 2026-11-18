import { Component, OnInit, signal } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos implements OnInit {
  // Estado del componente
  productos = signal<Producto[]>([]);
  cargando = signal(false);
  mensajeError = signal('');

  // Angular inyecta el servicio automáticamente
  constructor(private productoService: ProductoService) {}

  // Se ejecuta una vez cuando el componente aparece en pantalla
  ngOnInit(): void {
    this.cargarProductos();
  }

  // Pide los productos al servicio y actualiza la tabla
  async cargarProductos(): Promise<void> {
    this.cargando.set(true);
    this.mensajeError.set('');

    try {
      const datos = await this.productoService.obtenerProductos();
      this.productos.set(datos);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      this.mensajeError.set('No se pudieron cargar los productos. Intente nuevamente.');
    } finally {
      this.cargando.set(false);
    }
  }
}