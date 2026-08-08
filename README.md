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
- exceljs (importación Excel)

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
ADMIN_EMAIL="admin@mundo-crm.local"  # opcional
ADMIN_PASSWORD=""                    # requerido para setup-supabase.js
UPSTASH_REDIS_REST_URL=""            # opcional, recomendado en producción
UPSTASH_REDIS_REST_TOKEN=""          # opcional, recomendado en producción
SMTP_HOST=""
SMTP_PORT="587"
SMTP_SERVICE=""                    # opcional; usar "gmail" para Gmail
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
NEXT_PUBLIC_APP_URL=""
NEXT_PUBLIC_ROOT_DOMAIN=""
NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""
MERCADOPAGO_ACCESS_TOKEN=""
MERCADOPAGO_WEBHOOK_TOKEN=""
```

### Notificaciones de nuevos leads

Cuando un lead llega a la landing de un vendedor, Mundo CRM envía una notificación al email guardado en su perfil. Para Gmail, activa la verificación en dos pasos, crea una contraseña de aplicación y configura:

```env
SMTP_SERVICE="gmail"
SMTP_USER="tu-cuenta@gmail.com"
SMTP_PASS="tu-contraseña-de-aplicación"
SMTP_FROM="tu-cuenta@gmail.com"
```

Si usas otro proveedor, deja `SMTP_SERVICE` vacío y completa `SMTP_HOST` y `SMTP_PORT`.

## Comandos

```bash
# Instalar dependencias
npm install

# Configurar Supabase (bucket + usuario admin definido por variables)
npx dotenv-cli -e .env -- node scripts/setup-supabase.js

# Aplicar migración real del proyecto
node scripts/apply-migration.js

# Regenerar Prisma si cambió el schema
npx prisma generate

# Desarrollo (abre landing)
npm run dev

# Desarrollo (abre dashboard)
npm run dev:dashboard

# Seed de leads de ejemplo
npm run seed

# Correr tests
npm run test
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

## Producción y escalado

- **Connection Pooler de Supabase**: en Vercel serverless usá la URL del pooler (`...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`) para no agotar conexiones de PostgreSQL.
- **Upstash Redis**: configurá `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` para que el rate limiting sea global entre todas las instancias serverless. Sin esto, cada función tiene su propia memoria y el rate limit es local.
- **Cloudflare Turnstile**: opcional. Si algún día lo quieres activar, usa `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY`.
- **Meta Pixel**: configurá el `meta_pixel_id` desde el dashboard; se inyecta automáticamente en la landing.
- **CI/CD**: el workflow de GitHub Actions corre lint, tests y build en cada push/PR.

## Variables de producción

Configura estas variables en Vercel antes de lanzar:

```env
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_ROOT_DOMAIN=tu-dominio.cl
NEXT_PUBLIC_APP_URL=https://tu-dominio.cl
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_WEBHOOK_TOKEN=token-largo-seguro
```

En Supabase debes tener además:

- Auth habilitado para email/password.
- Bucket público `assets` creado.
- Base con `node scripts/apply-migration.js` ya aplicada.

## Despliegue recomendado

1. Crear proyecto en Supabase y cargar variables DB/Auth.
2. Ejecutar `node scripts/apply-migration.js` contra la base productiva.
3. Ejecutar `npx prisma generate`.
4. Crear bucket `assets` y admin con `node scripts/setup-supabase.js` usando `ADMIN_PASSWORD` fuerte.
5. Configurar dominio en Vercel y `NEXT_PUBLIC_ROOT_DOMAIN`.
6. Configurar MercadoPago productivo y el webhook en `https://tu-dominio.cl/api/webhooks/mercadopago?token=...`.
7. Verificar en Vercel que el workflow pase `lint`, `test` y `build` en cada push.
8. Probar subdominios reales con `NEXT_PUBLIC_ROOT_DOMAIN` y wildcard DNS apuntando a Vercel.
9. Probar registro, trial, cobro, cancelación, reactivación y formulario de leads en mobile y desktop.

## Subdominios de vendedores

Con `NEXT_PUBLIC_ROOT_DOMAIN=tu-dominio.cl` la app publica:

- `https://tu-dominio.cl` para la landing principal B2B.
- `https://fran.tu-dominio.cl` para la landing del seller `fran`.
- `/p/[slug]` queda como fallback técnico.

Antes de lanzar, confirma:

1. Que en Vercel agregaste el dominio raíz y el wildcard `*.tu-dominio.cl`.
2. Que el DNS wildcard apunta a Vercel.
3. Que ningún seller use slugs reservados como `admin`, `api`, `dashboard`, `auth` o `www`.
4. Que desde el dashboard los links publicados ya abran el subdominio final y no el fallback.

## Próximos pasos recomendados

Ver `PLAN-STACK-FUTURO.md` para el plan de escalado y refactorizaciones pendientes.
