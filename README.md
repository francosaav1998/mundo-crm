# Mundo CRM

Landing page de captación + dashboard interno para ejecutivas de ventas autorizadas de Mundo (Chile).

## Qué hace

- **Landing pública**: muestra planes de internet fibra, TV y telefonía móvil, captura leads y los envía por WhatsApp.
- **Dashboard privado**: gestión de leads, envío masivo de WhatsApp/email, importación Excel, administración de usuarios y personalización de la landing.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Prisma + PostgreSQL (Supabase)
- Supabase Auth
- Supabase Storage
- Nodemailer (SMTP opcional)

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
ADMIN_EMAIL="admin@mundo-crm.local"  # opcional
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
```

## Comandos

```bash
# Instalar dependencias
npm install

# Configurar Supabase (bucket + usuario admin admin/mundo2026)
npx dotenv-cli -e .env -- node scripts/setup-supabase.js

# Correr migraciones de Prisma
npx prisma migrate deploy

# Desarrollo (abre landing)
npm run dev

# Desarrollo (abre dashboard)
npm run dev:dashboard

# Seed de leads de ejemplo
npm run seed
```

## Seguridad

- Autenticación vía Supabase Auth.
- Middleware protege rutas de `/dashboard`.
- Rate limiting en endpoints públicos y sensibles.
- Sanitización de inputs para mitigar XSS.
- Cookies de sesión con flags de seguridad.
- Validación de tipos de archivo y tamaño en uploads.

## Estructura clave

```
/app/api                 → endpoints REST
/app/dashboard           → dashboard protegido
/components
  /dashboard
    /hooks               → useTheme, useSettings, useLeads, useStats
    /ui                  → KPIs, gráficos, tabla, filtros, paginación
    /features            → WhatsApp bulk, email bulk, import, usuarios, settings
  LandingPage.jsx
  DashboardClient.jsx
/lib/dashboard           → constants, utils
/lib                     → auth, prisma, supabase, rate-limit
/prisma                  → schema y migraciones
/scripts                 → setup, seed, utilidades
```

## Próximos pasos recomendados

Ver `PLAN-STACK-FUTURO.md` para el plan de escalado y refactorizaciones pendientes.
