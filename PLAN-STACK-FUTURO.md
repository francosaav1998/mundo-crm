# Plan de Stack para Escalar el Proyecto

> Estado: **En desarrollo**. Este plan queda guardado para ejecutarse una vez que el MVP esté listo.

---

## Stack Final

| Componente       | Servicio          | Para qué                                   |
| ---------------- | ----------------- | ------------------------------------------ |
| Código           | GitHub            | Control de versiones y deploys automáticos |
| Frontend/Backend | Vercel            | Hosting de Next.js, serverless, CDN        |
| Base de datos    | Supabase Postgres | Guardar leads, settings, admin             |
| Autenticación    | Supabase Auth     | Login del dashboard, sesiones, seguridad   |
| Archivos         | Supabase Storage  | Videos de fondo, foto del asesor           |

---

## Plan Paso a Paso

### 1. Subir el código a GitHub
- Crear un repositorio nuevo.
- Subir todo el proyecto con `git push`.

### 2. Crear proyecto en Supabase
- Crear una base de datos Postgres.
- Copiar la `DATABASE_URL` (connection string).
- Crear un bucket llamado `assets` o `videos` en Storage.

### 3. Adaptar el proyecto a Supabase
- Cambiar `prisma/schema.prisma` a `provider = "postgresql"`.
- Actualizar `.env` con la URL de Supabase.
- Correr:
  ```bash
  npx prisma migrate deploy
  ```
  Esto crea las tablas `Lead`, `Admin`, `Setting` en la nube.

### 4. Conectar Vercel a GitHub
- En Vercel, importar el repositorio.
- Vercel detecta automáticamente que es Next.js.

### 5. Configurar variables de entorno en Vercel
| Variable                          | Valor                                  |
| --------------------------------- | -------------------------------------- |
| `DATABASE_URL`                    | URL de Supabase                        |
| `NEXT_PUBLIC_SUPABASE_URL`        | URL del proyecto                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | anon key                               |
| `SUPABASE_SERVICE_ROLE_KEY`       | service role key (para subir archivos) |

### 6. Deploy
- Vercel hace build automático cada vez que se hace push a GitHub.

### 7. Cargar datos iniciales
- Correr el seed para crear el admin `admin / mundo2026`.

---

## Cambios Importantes Antes de Escalar

- [ ] Migrar la autenticación a **Supabase Auth** en lugar del JWT casero.
- [ ] Subir foto y video a **Supabase Storage**, no a localStorage.
- [ ] Proteger bien los endpoints (`/api/settings`, `/api/leads`) con Supabase.

---

## Costos

- **Vercel:** gratis para proyectos personales (límite de funciones serverless, más que suficiente para empezar).
- **Supabase:** gratis hasta 500 MB de base, 1 GB de storage, 2M peticiones.

---

## Checklist de Migración (para marcar cuando se empiece)

- [ ] Repositorio creado en GitHub
- [ ] Proyecto creado en Supabase
- [ ] `DATABASE_URL` configurada localmente
- [ ] Bucket `assets`/`videos` creado en Supabase Storage
- [ ] `schema.prisma` migrado a PostgreSQL
- [ ] Migraciones ejecutadas con `prisma migrate deploy`
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno cargadas en Vercel
- [ ] Primer deploy exitoso
- [ ] Seed de admin ejecutado en producción
- [ ] Autenticación migrada a Supabase Auth
- [ ] Uploads de archivos migrados a Supabase Storage
- [ ] Endpoints protegidos con Supabase
