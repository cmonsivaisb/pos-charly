# POS SaaS México - Backend

API robusta construida con **NestJS** y **Prisma ORM** para un sistema de Punto de Venta SaaS con soporte multi-tenancy.

## Características Técnicas

- **Multi-tenancy**: Aislamiento de datos por esquema/ID de tenant.
- **Autenticación**: JWT con roles (Super Admin, Admin, User).
- **Base de Datos**: PostgreSQL con Prisma.
- **Validación**: DTOs con `class-validator`.
- **Documentación**: Swagger UI integrada en `/api/docs`.
- **Almacenamiento**: Soporte para subida de imágenes de productos (Multer).

## Configuración

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```
2.  **Variables de Entorno**:
    Crea un archivo `.env` basado en la configuración de PostgreSQL:
    ```env
    DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"
    JWT_ACCESS_SECRET="secreto_muy_seguro"
    API_PORT=3001
    ```
3.  **Base de Datos**:
    ```bash
    npx prisma migrate dev
    ```
4.  **Seed (Datos Iniciales)**:
    Por seguridad, el archivo de semilla está ignorado. Usa la plantilla:
    ```bash
    cp prisma/seed.ts.template prisma/seed.ts
    npx prisma db seed
    ```

## Scripts

- `npm run start:dev`: Inicia el servidor en modo desarrollo.
- `npm run build`: Compila el proyecto para producción.
- `npx prisma studio`: Abre el explorador de base de datos de Prisma.

## Estructura de Módulos

- `src/auth`: Gestión de tokens y login.
- `src/tenancy`: Lógica de aislamiento y guards de suscripción.
- `src/products`: CRUD de productos con manejo de imágenes y precios.
- `src/sales`: Registro de transacciones.
- `src/admin`: Panel de control global para la plataforma SaaS.
