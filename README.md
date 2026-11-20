# Gestión de productos — CRUD con Angular y Cloud Firestore

Aplicación web desarrollada en **Angular** que permite **registrar, consultar, actualizar y eliminar productos** almacenados en **Cloud Firestore** (Firebase). La tabla se sincroniza **en tiempo real**: cualquier cambio en la base de datos aparece en la página sin necesidad de recargarla.

- **Asignatura:** Programación y Plataformas Web — Universidad Politécnica Salesiana
- **Práctica:** 02.2 — Desarrollo de un CRUD de productos con Angular y Firebase
- **Autor:** Carlos Cajas

##  Enlaces

- **Aplicación publicada (Vercel):** https://TU-PROYECTO.vercel.app
- **Repositorio (GitHub):** https://github.com/andres-cajas-14/PROGRAWEB_P69_ANGULAR_FIREBASE_JAVA_PRODUCTO-

---

##  Tecnologías

| Tecnología | Uso |
|---|---|
| Angular 22 | Framework de la interfaz (componentes standalone, signals, formularios reactivos) |
| TypeScript | Lenguaje del proyecto |
| Firebase SDK web (`firebase`) | Conexión con Cloud Firestore |
| `rxfire` (`collectionData`) | Lectura de la colección como `Observable` en tiempo real |
| RxJS | Manejo de `Observable` y suscripciones |
| Cloud Firestore | Base de datos NoSQL donde se guardan los productos |
| Vercel | Despliegue de la aplicación |

---

##  Funciones del CRUD

| Operación | Cómo se usa en la aplicación | Método de `ProductoService` | Función de Firestore |
|---|---|---|---|
| **Crear** | Llenar el formulario y presionar **Registrar** | `crearProducto(producto)` | `addDoc` |
| **Consultar** | La tabla muestra los productos al abrir la página y se actualiza sola | `obtenerProductos()` | `collectionData` (`rxfire`) |
| **Actualizar** | Presionar **Editar** en una fila, modificar los datos y presionar **Actualizar** | `actualizarProducto(id, producto)` | `doc` + `updateDoc` |
| **Eliminar** | Presionar **Eliminar** y confirmar. Si se cancela, el producto se conserva | `eliminarProducto(id)` | `doc` + `deleteDoc` |

### Validaciones del formulario

**Condiciones simultáneas (todas deben cumplirse para guardar):** un producto solo se registra o actualiza cuando los cuatro campos son válidos al mismo tiempo.

| Campo | Condición que debe cumplir | Validadores de Angular |
|---|---|---|
| `nombre` | No estar vacío **y** contener al menos una letra | `Validators.required` + `Validators.pattern(/\p{L}/u)` |
| `precio` | No estar vacío, ser numérico **y** ser mayor o igual a 0 | `Validators.required` + `Validators.min(0)` |
| `stock` | No estar vacío, ser un número entero **y** ser mayor o igual a 0 | `Validators.required` + `Validators.min(0)` + validador propio `soloEnteros` |
| `categoria` | No estar vacía **y** contener al menos una letra | `Validators.required` + `Validators.pattern(/\p{L}/u)` |

**Condiciones alternativas (basta una para rechazar el formulario):**

| Caso inválido | Ejemplo | Mensaje que se muestra |
|---|---|---|
| Nombre vacío **o** sin letras | `""`, `"123"` | El nombre es obligatorio y debe contener letras. |
| Precio vacío | `""` | El precio es obligatorio y debe ser numérico. |
| Precio negativo | `-5` | Debe ser mayor o igual a 0. |
| Stock vacío | `""` | El stock es obligatorio. |
| Stock negativo | `-1` | Debe ser mayor o igual a 0. |
| Stock con decimales | `2.5` | Debe ser un número entero. |
| Categoría vacía **o** sin letras | `""`, `"4658"` | La categoría es obligatoria y debe contener letras. |

Mientras exista al menos un caso inválido, el botón **Registrar / Actualizar** permanece deshabilitado y el método `guardar()` no envía nada a Firestore. Además, las reglas de seguridad de Firestore repiten la validación en el servidor.

**Mensajes de la aplicación:**

| Situación | Mensaje |
|---|---|
| Registro, edición o eliminación correcta | Mensaje verde de confirmación |
| Eliminación cancelada | "Eliminación cancelada. El producto se conserva." |
| Falla al guardar o eliminar | "No se pudo guardar/eliminar el producto. Intente nuevamente." |
| Falla al cargar la colección | "No se pudieron cargar los productos. Verifique su conexión." |
| Colección vacía | "No hay productos registrados." |

---

##  Modelo de producto

Cada documento de la colección `productos` tiene esta estructura:

```typescript
export interface Producto {
  id?: string;       
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}
```

Ejemplo de documento en Firestore:

| Campo | Tipo | Valor |
|---|---|---|
| nombre | string | Laptop Lenovo |
| precio | number | 800 |
| stock | number | 10 |
| categoria | string | Tecnologia |

---

##  Estructura principal

```
src/
├── app/
│   ├── components/productos/
│   │   ├── productos.ts         
│   │   ├── productos.html       
│   │   └── productos.css         
│   ├── models/
│   │   └── producto.ts           
│   ├── services/
│   │   └── producto.service.ts   
│   ├── firebase.config.ts        
│   ├── app.ts / app.html        
│   ├── environment.example.ts    
│   └── environment.ts           
scripts/
└── set-env.mjs                   
vercel.json                       
```

**Separación de responsabilidades:** el componente `Productos` no importa nada de Firebase. Solo llama a los métodos de `ProductoService`, que es el único que accede a Firestore.

---

##  Configuración de Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Ir a **Firestore Database** y crear la base de datos.
3. Crear la colección `productos` con documentos que tengan los campos `nombre` (string), `precio` (number), `stock` (number) y `categoria` (string).
4. En **Configuración del proyecto → General → Tus aplicaciones**, registrar una **aplicación web** (`</>`) y copiar el objeto `firebaseConfig`.
5. En **Firestore Database → Reglas**, publicar estas reglas, que permiten trabajar solo con la colección `productos` y validan los datos:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function esProductoValido(p) {
      return p.keys().hasOnly(['nombre', 'precio', 'stock', 'categoria'])
        && p.nombre is string && p.nombre.size() > 0
        && p.categoria is string && p.categoria.size() > 0
        && p.precio is number && p.precio >= 0
        && p.stock is int && p.stock >= 0;
    }

    match /productos/{productoId} {
      allow read, delete: if true;
      allow create, update: if esProductoValido(request.resource.data);
    }
  }
}
```

---

##  Instalación y ejecución local

**Requisitos:** Node.js 20 o superior, npm y Angular CLI (`npm install -g @angular/cli`).

```bash
# 1. Clonar el repositorio y entrar en la carpeta del proyecto
git clone https://github.com/andres-cajas-14/PROGRAWEB_P69_ANGULAR_FIREBASE_JAVA_PRODUCTO-.git
cd PROGRAWEB_P69_ANGULAR_FIREBASE_JAVA_PRODUCTO-

# 2. Instalar las dependencias
npm install
```

**3. Configurar las credenciales de Firebase.** Copiar la plantilla:

```bash
# Windows (PowerShell)
Copy-Item src/environments/environment.example.ts src/environments/environment.ts

# Linux / macOS
cp src/environments/environment.example.ts src/environments/environment.ts
```

Luego abrir `src/environments/environment.ts` y reemplazar los valores de ejemplo por los del `firebaseConfig` del proyecto.

```bash
# 4. Ejecutar la aplicación
ng serve -o
```

La aplicación se abre en `http://localhost:4200`. Todos los comandos se ejecutan dentro de la carpeta `PROGRAWEB_P69_ANGULAR_FIREBASE_JAVA_PRODUCTO-`, que se crea al clonar el repositorio.

**Pruebas unitarias:**

```bash
ng test --watch=false
```

---

##  Despliegue en Vercel

Como `environment.ts` no se sube a GitHub, en Vercel se genera automáticamente durante la compilación con el script `scripts/set-env.mjs`, que se ejecuta antes de `ng build` (`prebuild` en `package.json`).

1. Importar el repositorio de GitHub en [Vercel](https://vercel.com).
2. En **Environment Variables**, agregar estas variables con los valores de `firebaseConfig`:

| Variable | Valor de `firebaseConfig` |
|---|---|
| `FIREBASE_API_KEY` | `apiKey` |
| `FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `FIREBASE_PROJECT_ID` | `projectId` |
| `FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `FIREBASE_APP_ID` | `appId` |

3. El archivo `vercel.json` ya indica el comando de compilación (`npm run build`) y la carpeta de salida (`dist/CRUD-productos/browser`).
4. Presionar **Deploy** y abrir la URL pública para probar las cuatro operaciones.

---

##  Pruebas realizadas

- Registro de un producto válido y verificación de su ID en Firestore.
- Edición del producto, comprobando que conserva el mismo ID.
- Cancelación de una eliminación (el producto se conserva) y eliminación confirmada.
- Rechazo de datos inválidos: nombre vacío, precio negativo y stock con decimales.
- Persistencia: después de crear, editar y eliminar, se recargó la página y Firestore conservó cada cambio.
