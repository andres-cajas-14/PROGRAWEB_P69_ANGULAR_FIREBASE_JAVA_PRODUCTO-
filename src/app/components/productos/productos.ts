import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto';


function soloEnteros(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor === null || valor === '') {
    return null; // de los vacíos se encarga Validators.required
  }
  return Number.isInteger(Number(valor)) ? null : { entero: true };
}

@Component({
  selector: 'app-productos',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos implements OnInit, OnDestroy {
  
  productos = signal<Producto[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');
  idEditando = signal<string | null>(null); // null = modo crear

  private suscripcion?: Subscription;

  
  formulario = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\p{L}/u)],
    }),
    precio: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
    ]),
    stock: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
      soloEnteros,
    ]),
    categoria: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\p{L}/u)],
    }),
  });

  
  get campos() {
    return this.formulario.controls;
  }

  constructor(private productoService: ProductoService) {}

 
  ngOnInit(): void {
    this.suscripcion = this.productoService.obtenerProductos().subscribe({
      next: (datos) => {
        this.productos.set(datos);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
        this.mensajeError.set('No se pudieron cargar los productos. Verifique su conexión.');
        this.cargando.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  
  async guardar(): Promise<void> {
    this.limpiarMensajes();

    
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensajeError.set('Corrija los campos marcados antes de guardar.');
      return;
    }

    const valores = this.formulario.getRawValue();
    const producto: Producto = {
      nombre: valores.nombre.trim(),
      precio: Number(valores.precio),
      stock: Number(valores.stock),
      categoria: valores.categoria.trim(),
    };

    this.guardando.set(true);
    try {
      const id = this.idEditando();
      if (id) {
        await this.productoService.actualizarProducto(id, producto);
        this.mensajeExito.set(`Producto "${producto.nombre}" actualizado correctamente.`);
      } else {
        await this.productoService.crearProducto(producto);
        this.mensajeExito.set(`Producto "${producto.nombre}" registrado correctamente.`);
      }
      this.cancelarEdicion();
    } catch (error) {
      console.error('Error al guardar:', error);
      this.mensajeError.set('No se pudo guardar el producto. Intente nuevamente.');
    } finally {
      this.guardando.set(false);
    }
  }

 
  editar(producto: Producto): void {
    this.limpiarMensajes();
    this.idEditando.set(producto.id ?? null);
    this.formulario.setValue({
      nombre: producto.nombre ?? '',
      precio: producto.precio ?? null,
      stock: producto.stock ?? null,
      categoria: producto.categoria ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

 
  cancelarEdicion(): void {
    this.idEditando.set(null);
    this.formulario.reset();
  }

 
  async eliminar(producto: Producto): Promise<void> {
    this.limpiarMensajes();

    const confirmado = confirm(`¿Desea eliminar el producto "${producto.nombre}"?`);
    if (!confirmado) {
      this.mensajeExito.set('Eliminación cancelada. El producto se conserva.');
      return;
    }

    try {
      await this.productoService.eliminarProducto(producto.id!);
      if (this.idEditando() === producto.id) {
        this.cancelarEdicion();
      }
      this.mensajeExito.set(`Producto "${producto.nombre}" eliminado correctamente.`);
    } catch (error) {
      console.error('Error al eliminar:', error);
      this.mensajeError.set('No se pudo eliminar el producto. Intente nuevamente.');
    }
  }

  private limpiarMensajes(): void {
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }
}