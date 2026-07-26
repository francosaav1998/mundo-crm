## Produccion - Checklist Pendiente

Estado actual:
- Suscripciones con MercadoPago implementadas en codigo.
- Trial de 7 dias implementado.
- Seccion `Facturacion` agregada al dashboard del vendedor.
- Webhook de MercadoPago creado.

## 1. Configurar MercadoPago en produccion

- [ ] Crear aplicacion en MercadoPago Developers.
- [ ] Obtener `MERCADOPAGO_ACCESS_TOKEN`.
- [ ] Agregar variable en Vercel:

```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
```

- [ ] Probar creacion de suscripcion desde `/dashboard?tab=billing`.

## 2. Configurar webhook de MercadoPago

- [ ] Ir a MercadoPago > Developers > Webhooks.
- [ ] Configurar URL:

```text
https://mundo-crm.vercel.app/api/webhooks/mercadopago
```

- [ ] Activar eventos de:
  - `preapproval`
  - `payment`

## 3. Aplicar migracion en base de datos

- [ ] Verificar que `DATABASE_URL` y `DIRECT_URL` apunten a produccion.
- [ ] Ejecutar:

```bash
node scripts/apply-migration.js
npx prisma generate
```

- [ ] Confirmar que existan las tablas:
  - `Subscription`
  - `PaymentHistory`

## 4. Configurar dominio en GoDaddy + Vercel

- [ ] Comprar dominio principal.
- [ ] Conectarlo en Vercel.
- [ ] Configurar registros DNS:

```text
A      @      -> IP de Vercel
CNAME  *      -> cname.vercel-dns.com
```

- [ ] Verificar que cargue el dominio principal.

## 5. Implementar subdominios por vendedor

Objetivo:

```text
https://tudominio.com            -> landing B2B
https://fran.tudominio.com       -> landing del vendedor fran
https://carla.tudominio.com      -> landing del vendedor carla
```

Pendiente en codigo:
- [ ] Leer el `host` en middleware.
- [ ] Resolver subdominio a seller slug.
- [ ] Mostrar landing del vendedor sin usar `/p/[slug]` en el link principal.
- [ ] Mantener `/p/[slug]` como fallback.

## 6. Revisar flujo comercial

- [ ] Confirmar que solo existira 1 plan mensual de `$29.990`.
- [ ] Confirmar politica despues del trial:
  - sin pago = landing inactiva
  - dashboard limitado o aviso de pago
- [ ] Confirmar si el cobro sera mensual automatico siempre.

## 7. Revisar experiencia de facturacion

- [ ] Mostrar estado de suscripcion tambien al admin.
- [ ] Mostrar fecha de proximo cobro en panel admin.
- [ ] Agregar aviso visible cuando el trial este por vencer.
- [ ] Agregar aviso cuando el pago falle.

## 8. Legal minimo antes de cobrar

- [ ] Terminos y condiciones reales.
- [ ] Politica de privacidad real.
- [ ] Texto de autorizacion de cobro recurrente.
- [ ] Texto de cancelacion de suscripcion.

## 9. Validaciones finales antes de lanzamiento

- [ ] Crear vendedor de prueba.
- [ ] Activar trial correctamente.
- [ ] Crear suscripcion en MercadoPago.
- [ ] Confirmar webhook.
- [ ] Confirmar activacion automatica.
- [ ] Confirmar desactivacion al cancelar o fallar.
- [ ] Probar desktop y mobile.

## 10. Siguiente implementacion recomendada

Orden sugerido:

1. Configurar MercadoPago real en Vercel.
2. Aplicar migracion en Supabase.
3. Probar facturacion completa end-to-end.
4. Implementar subdominios por vendedor.
5. Ajustar bloqueo por falta de pago.
6. Lanzar con dominio final.
