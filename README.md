# DJENGUA API

API RESTful para la gestión de usuarios, empresas, productos, categorías y paquetes para un sistema de comercio electrónico.

## Características

*   **Autenticación y autorización:** Registro de usuarios, inicio de sesión y protección de rutas mediante JSON Web Tokens (JWT).
*   **Gestión de usuarios:** Operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para usuarios.
*   **Gestión de empresas:** Operaciones CRUD para empresas.
*   **Gestión de productos:** Operaciones CRUD para productos.
*   **Gestión de categorías:** Operaciones CRUD para categorías.
*   **Gestión de paquetes:** Operaciones CRUD para paquetes (bundles).
*   **Endpoints de comercio electrónico:** Endpoints públicos para consultar productos, categorías y empresas.

## Tecnologías utilizadas

*   **Node.js:** Entorno de ejecución de JavaScript.
*   **Express:** Framework web para Node.js.
*   **TypeScript:** Superset de JavaScript que añade tipado estático.
*   **MongoDB:** Base de datos NoSQL.
*   **Mongoose:** ODM (Object Data Modeling) para MongoDB.
*   **JSON Web Tokens (JWT):** Para la autenticación y autorización.
*   **Bcrypt.js:** Para el hash de contraseñas.
*   **Dotenv:** Para la gestión de variables de entorno.
*   **Jest y Supertest:** Para las pruebas unitarias y de integración.

## Instalación

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/tu-usuario/djengua-api.git
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```

## Configuración

1.  Crea un archivo `.env` en la raíz del proyecto con las siguientes variables de entorno:

    ```
    NODE_ENV=development
    PORT=3000
    MONGO_URI=<tu-uri-de-mongodb>
    JWT_SECRET=<tu-secreto-de-jwt>
    JWT_EXPIRE=30d
    JWT_COOKIE_EXPIRE=30
    ```

## Scripts

*   `npm run build`: Compila el código de TypeScript a JavaScript.
*   `npm start`: Inicia la aplicación en modo de producción.
*   `npm run dev`: Inicia la aplicación en modo de desarrollo con recarga automática.
*   `npm test`: Ejecuta las pruebas.
*   `npm run test:watch`: Ejecuta las pruebas en modo de observación.
*   `npm run test:coverage`: Ejecuta las pruebas y genera un informe de cobertura.
*   `npm run test:integration`: Ejecuta las pruebas de integración.

---

## Documentación de la API

### Autenticación

#### `POST /api/auth/register`

Registra un nuevo usuario.

**Parámetros del cuerpo:**

*   `name` (string, requerido): Nombre del usuario.
*   `lastName` (string, requerido): Apellido del usuario.
*   `email` (string, requerido): Email del usuario.
*   `password` (string, requerido): Contraseña del usuario (mínimo 6 caracteres).
*   `phone` (string, opcional): Teléfono del usuario.

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "token": "..."
}
```

### Empresas

Todas las rutas de empresas requieren autenticación.

#### `GET /api/companies`

Obtiene todas las empresas.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "...",
      "name": "...",
      "description": "...",
      "isActive": true,
      "createdBy": {
        "id": "...",
        "name": "...",
        "lastName": "...",
        "email": "..."
      },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### `POST /api/companies`

Crea una nueva empresa.

**Parámetros del cuerpo:**

*   `name` (string, requerido): Nombre de la empresa.
*   `description` (string, opcional): Descripción de la empresa.
*   `isActive` (boolean, opcional): Estado de la empresa.

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "message": "Compañía creada exitosamente",
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "isActive": true,
    "createdBy": {
      "id": "...",
      "name": "...",
      "lastName": "...",
      "email": "..."
    },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `GET /api/companies/:id`

Obtiene una empresa por su ID.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "isActive": true,
    "createdBy": {
      "id": "...",
      "name": "...",
      "description": "...",
      "isActive": true,
      "createdAt": "...",
      "createdBy": null
    },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `PUT /api/companies/:id`

Actualiza una empresa.

**Parámetros del cuerpo:**

*   `name` (string, opcional): Nombre de la empresa.
*   `description` (string, opcional): Descripción de la empresa.
*   `isActive` (boolean, opcional): Estado de la empresa.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "isActive": true,
    "createdBy": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `DELETE /api/companies/:id`

Elimina una empresa.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {}
}
```

### Comercio Electrónico

Estas rutas son públicas y no requieren autenticación.

#### `GET /api/e-commerce/categories`

Obtiene todas las categorías públicas de una empresa.

**Parámetros de consulta:**

*   `companyId` (string, requerido): ID de la empresa.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "...",
      "name": "..."
    }
  ]
}
```

#### `GET /api/e-commerce/:companyId`

Obtiene todos los productos de una empresa.

**Parámetros de consulta:**

*   `searchTerm` (string, opcional): Término de búsqueda.
*   `categoryId` (string, opcional): ID de la categoría para filtrar productos.
*   `page` (number, opcional): Número de página.
*   `limit` (number, opcional): Límite de productos por página.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "...",
      "name": "...",
      "description": "...",
      "companyId": {
        "id": "...",
        "name": "..."
      },
      "categoryId": {
        "id": "...",
        "name": "...",
        "description": "..."
      },
      "images": [],
      "quantity": 0,
      "price": 0,
      "cost": 0,
      "sku": "...",
      "createdAt": "..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 1,
    "nextPage": null,
    "prevPage": null
  }
}
```

#### `GET /api/e-commerce/company/:id`

Obtiene la información pública de una empresa.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "description": "..."
  }
}
```

#### `GET /api/e-commerce/product/:id`

Obtiene la información pública de un producto.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "companyId": {
      "id": "...",
      "name": "..."
    },
    "categoryId": {
      "id": "...",
      "name": "..."
    },
    "images": [],
    "quantity": 0,
    "price": 0,
    "cost": 0,
    "sku": "...",
    "color": "...",
    "specs": [],
    "fre_shipping": false,
    "warranty": false,
    "discount": 0,
    "createdAt": "..."
  }
}
```

### Paquetes (Bundles)

Todas las rutas de paquetes requieren autenticación.

#### `GET /api/bundles`

Obtiene todos los paquetes.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "...",
      "description": "...",
      "isActive": true,
      "published": false,
      "createdBy": "...",
      "companyId": "...",
      "categoryId": "...",
      "products": [],
      "quantity": 0,
      "price": 0,
      "images": [],
      "sku": "...",
      "rating": 0,
      "specs": [],
      "free_shipping": false,
      "warranty": false,
      "discount": 0,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 1
}
```

#### `POST /api/bundles`

Crea un nuevo paquete.

**Parámetros del cuerpo:**

*   `bundle` (object, requerido): Objeto que contiene la información del paquete.
    *   `name` (string, requerido): Nombre del paquete.
    *   `description` (string, opcional): Descripción del paquete.
    *   `isActive` (boolean, opcional): Estado del paquete.
    *   `published` (boolean, opcional): Si el paquete está publicado.
    *   `categoryId` (object, requerido): Objeto con el ID de la categoría.
        *   `id` (string, requerido): ID de la categoría.
    *   `products` (array, opcional): Array de IDs de productos.
    *   `quantity` (number, requerido): Cantidad del paquete.
    *   `price` (number, requerido): Precio del paquete.
    *   `images` (array, opcional): Array de objetos de imagen.
    *   `sku` (string, requerido): SKU del paquete.
    *   `rating` (number, opcional): Calificación del paquete.
    *   `specs` (array, opcional): Array de objetos de especificaciones.
    *   `free_shipping` (boolean, opcional): Si el paquete tiene envío gratis.
    *   `warranty` (boolean, opcional): Si el paquete tiene garantía.
    *   `discount` (number, opcional): Descuento del paquete.

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "message": "Bundle creado exitosamente",
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "isActive": true,
    "published": false,
    "createdBy": "...",
    "companyId": "...",
    "categoryId": "...",
    "products": [],
    "quantity": 0,
    "price": 0,
    "images": [],
    "sku": "...",
    "rating": 0,
    "specs": [],
    "free_shipping": false,
    "warranty": false,
    "discount": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `GET /api/bundles/:id`

Obtiene un paquete por su ID.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "isActive": true,
    "published": false,
    "createdBy": "...",
    "companyId": "...",
    "categoryId": "...",
    "products": [],
    "quantity": 0,
    "price": 0,
    "images": [],
    "sku": "...",
    "rating": 0,
    "specs": [],
    "free_shipping": false,
    "warranty": false,
    "discount": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `PUT /api/bundles/:id`

Actualiza un paquete.

**Parámetros del cuerpo:**

*   `bundle` (object, requerido): Objeto con los campos a actualizar.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Bundle actualizado exitosamente",
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "isActive": true,
    "published": false,
    "createdBy": "...",
    "companyId": "...",
    "categoryId": "...",
    "products": [],
    "quantity": 0,
    "price": 0,
    "images": [],
    "sku": "...",
    "rating": 0,
    "specs": [],
    "free_shipping": false,
    "warranty": false,
    "discount": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Productos

Todas las rutas de productos requieren autenticación.

#### `GET /api/products`

Obtiene todos los productos.

**Parámetros de consulta:**

*   `q` (string, opcional): Término de búsqueda para filtrar productos por nombre, SKU o descripción.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "...",
      "description": "...",
      "isActive": true,
      "createdBy": {
        "id": "...",
        "name": "...",
        "description": "...",
        "isActive": true,
        "createdAt": "...",
        "companyId": "..."
      },
      "companyId": {
        "id": "...",
        "name": "...",
        "description": "..."
      },
      "categoryId": {
        "id": "...",
        "name": "...",
        "description": "..."
      },
      "images": [],
      "quantity": 0,
      "price": 0,
      "cost": 0,
      "sku": "...",
      "published": false,
      "includeTax": false,
      "tax": 0,
      "specs": [],
      "free_shipping": false,
      "warranty": false,
      "discount": 0,
      "unlimited": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 1
}
```

#### `POST /api/products`

Crea un nuevo producto.

**Parámetros del cuerpo:**

*   `product` (object, requerido): Objeto que contiene la información del producto.
    *   `name` (string, requerido): Nombre del producto.
    *   `description` (string, opcional): Descripción del producto.
    *   `isActive` (boolean, opcional): Estado del producto.
    *   `quantity` (number, requerido): Cantidad del producto.
    *   `price` (number, requerido): Precio del producto.
    *   `published` (boolean, opcional): Si el producto está publicado.
    *   `includeTax` (boolean, opcional): Si el precio incluye impuestos.
    *   `categoryId` (object, requerido): Objeto con el ID de la categoría.
        *   `id` (string, requerido): ID de la categoría.
    *   `sku` (string, requerido): SKU del producto.
    *   `cost` (number, opcional): Costo del producto.
    *   `tax` (number, opcional): Impuesto del producto.
    *   `color` (string, opcional): Color del producto.
    *   `images` (array, opcional): Array de objetos de imagen.
    *   `specs` (array, opcional): Array de objetos de especificaciones.
    *   `free_shipping` (boolean, opcional): Si el producto tiene envío gratis.
    *   `warranty` (boolean, opcional): Si el producto tiene garantía.
    *   `discount` (number, opcional): Descuento del producto.
    *   `unlimited` (boolean, opcional): Si el producto tiene stock ilimitado.

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "isActive": true,
    "createdBy": "...",
    "companyId": "...",
    "categoryId": "...",
    "images": [],
    "quantity": 0,
    "price": 0,
    "cost": 0,
    "sku": "...",
    "published": false,
    "includeTax": false,
    "tax": 0,
    "specs": [],
    "free_shipping": false,
    "warranty": false,
    "discount": 0,
    "unlimited": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `GET /api/products/search`

Busca productos.

**Parámetros de consulta:**

*   `q` (string, opcional): Término de búsqueda.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "...",
      "sku": "...",
      "categoryId": {
        "id": "...",
        "name": "...",
        "description": "..."
      },
      "price": 0,
      "quantity": 0
    }
  ],
  "total": 1
}
```

#### `POST /api/products/by-ids`

Busca productos por sus IDs.

**Parámetros del cuerpo:**

*   `ids` (array, requerido): Array de IDs de productos.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "...",
      "description": "...",
      "companyId": {
        "id": "...",
        "name": "...",
        "description": "..."
      },
      "categoryId": {
        "id": "...",
        "name": "...",
        "description": "..."
      },
      "sku": "...",
      "isActive": true
    }
  ],
  "total": 1
}
```

#### `GET /api/products/:id`

Obtiene un producto por su ID.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "isActive": true,
    "createdBy": {
      "id": "...",
      "name": "...",
      "lastName": "..."
    },
    "companyID": {
      "id": "...",
      "name": "...",
      "description": "...",
      "isActive": true
    },
    "categoryId": {
      "id": "...",
      "name": "...",
      "description": "...",
      "isActive": true
    },
    "images": [],
    "quantity": 0,
    "price": 0,
    "cost": 0,
    "sku": "...",
    "published": false,
    "includeTax": false,
    "tax": 0,
    "specs": [],
    "free_shipping": false,
    "warranty": false,
    "discount": 0,
    "unlimited": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `PUT /api/products/:id`

Actualiza un producto.

**Parámetros del cuerpo:**

*   `product` (object, requerido): Objeto con los campos a actualizar.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Producto actualizado exitosamente",
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "isActive": true,
    "createdBy": "...",
    "companyId": "...",
    "categoryId": "...",
    "images": [],
    "quantity": 0,
    "price": 0,
    "cost": 0,
    "sku": "...",
    "published": false,
    "includeTax": false,
    "tax": 0,
    "specs": [],
    "free_shipping": false,
    "warranty": false,
    "discount": 0,
    "unlimited": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `DELETE /api/products/:id`

Elimina un producto.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {}
}
```

### Categorías

Todas las rutas de categorías requieren autenticación.

#### `GET /api/categories`

Obtiene todas las categorías.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "...",
      "name": "...",
      "description": "...",
      "isActive": true,
      "userId": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### `POST /api/categories`

Crea una nueva categoría.

**Parámetros del cuerpo:**

*   `name` (string, requerido): Nombre de la categoría.
*   `description` (string, opcional): Descripción de la categoría.
*   `isActive` (boolean, opcional): Estado de la categoría.

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "message": "Categoría creada exitosamente",
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "isActive": true,
    "userId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `GET /api/categories/:id`

Obtiene una categoría por su ID.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "isActive": true,
    "userId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `PUT /api/categories/:id`

Actualiza una categoría.

**Parámetros del cuerpo:**

*   `name` (string, opcional): Nombre de la categoría.
*   `description` (string, opcional): Descripción de la categoría.
*   `isActive` (boolean, opcional): Estado de la categoría.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "isActive": true,
    "userId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `DELETE /api/categories/:id`

Elimina una categoría.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {}
}
```

### Usuarios

Todas las rutas de usuarios requieren autenticación.

#### `GET /api/users`

Obtiene todos los usuarios.

**Parámetros de consulta:**

*   `company` (string, opcional): ID de la empresa para filtrar usuarios.
*   `role` (string, opcional): Rol para filtrar usuarios.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "...",
      "name": "...",
      "lastName": "...",
      "email": "...",
      "role": "...",
      "isActive": true,
      "activeCompany": {
        "id": "...",
        "name": "...",
        "description": "..."
      },
      "companies": [
        {
          "id": "...",
          "name": "...",
          "description": "..."
        }
      ],
      "phone": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### `POST /api/users`

Crea un nuevo usuario.

**Parámetros del cuerpo:**

*   `email` (string, requerido): Email del usuario.
*   `name` (string, requerido): Nombre del usuario.
*   `lastName` (string, opcional): Apellido del usuario.
*   `role` (string, opcional): Rol del usuario.
*   `password` (string, requerido): Contraseña del usuario.
*   `phone` (string, requerido): Teléfono del usuario.
*   `companies` (array, opcional): Array de IDs de empresas a las que pertenece el usuario.

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "...",
    "lastName": "...",
    "email": "...",
    "role": "...",
    "isActive": true,
    "activeCompany": "...",
    "companies": ["..."],
    "phone": "...",
    "createdBy": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `GET /api/users/me`

Obtiene el usuario autenticado.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "lastName": "...",
    "email": "...",
    "role": "...",
    "isActive": true,
    "activeCompany": {
      "id": "...",
      "name": "...",
      "description": "..."
    },
    "companies": [
      {
        "id": "...",
        "name": "...",
        "description": "..."
      }
    ],
    "phone": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `GET /api/users/:id`

Obtiene un usuario por su ID.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "lastName": "...",
    "email": "...",
    "role": "...",
    "isActive": true,
    "activeCompany": {
      "id": "...",
      "name": "...",
      "description": "...",
      "isActive": true,
      "createdBy": {
        "name": "...",
        "lastName": "...",
        "email": "..."
      }
    },
    "companies": ["..."],
    "phone": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `PUT /api/users/:id`

Actualiza un usuario.

**Parámetros del cuerpo:**

*   `name` (string, opcional): Nombre del usuario.
*   `lastName` (string, opcional): Apellido del usuario.
*   `email` (string, opcional): Email del usuario.
*   `role` (string, opcional): Rol del usuario.
*   `isActive` (boolean, opcional): Estado del usuario.
*   `phone` (string, opcional): Teléfono del usuario.
*   `password` (string, opcional): Contraseña del usuario.
*   `reset` (boolean, opcional): Si es `true`, se genera una nueva contraseña.
*   `companies` (array, opcional): Array de IDs de empresas a las que pertenece el usuario.
*   `activeCompany` (string, opcional): ID de la empresa activa del usuario.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "lastName": "...",
    "email": "...",
    "role": "...",
    "isActive": true,
    "activeCompany": "...",
    "companies": ["..."],
    "phone": "...",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Usuario actualizado exitosamente"
}
```

#### `DELETE /api/users/:id`

Elimina un usuario.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {}
}
```

#### `PATCH /api/users/:id/change-company`

Cambia la empresa activa de un usuario.

**Parámetros del cuerpo:**

*   `id` (string, requerido): ID de la empresa.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "lastName": "...",
    "email": "...",
    "role": "...",
    "isActive": true,
    "activeCompany": "...",
    "companies": ["..."],
    "phone": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### `POST /api/auth/login`

Inicia sesión de un usuario.

**Parámetros del cuerpo:**

*   `email` (string, requerido): Email del usuario.
*   `password` (string, requerido): Contraseña del usuario.
*   `rememberMe` (boolean, opcional): Si es `true`, el token expira en 30 días, de lo contrario, en 1 día.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "token": "..."
}
```
