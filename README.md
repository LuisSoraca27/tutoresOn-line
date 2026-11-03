# TutoresOn-Line

Aplicación de tutorías virtuales y presenciales con frontend Next.js y backend
Express. El proyecto usa un workspace de npm: la raíz contiene el frontend y
`backend/` contiene la API, su esquema Prisma y sus dependencias.

## Inicio local

Con Node.js 22.18 o superior y Docker Desktop en marcha:

```bash
npm ci
docker compose up -d --wait
npm run db:setup
npm run db:seed:demo
npm run backend:dev
```

En otra terminal, copia `.env.example` a `.env.local` y ejecuta:

```bash
npm run dev
```

Abre [localhost:3000](http://localhost:3000). La API está en
[localhost:8000/api/v1/health](http://localhost:8000/api/v1/health). El puerto
local de PostgreSQL es `55432`. Para cambiar la configuración de la API, copia
`backend/.env.example` a `backend/.env`; los valores locales predeterminados
coinciden con Docker Compose.

## Cuentas de demostración

`npm run db:seed:demo` crea estas cuentas si aún no existen; no modifica
cuentas ni contraseñas existentes. La contraseña para ambas es `demo1234`.

| Rol | Correo |
| --- | --- |
| Estudiante | `sara@ejemplo.co` |
| Tutor | `mariana@ejemplo.co` |

Las cuentas, sesiones, perfiles públicos, disponibilidad y reservas se guardan en
PostgreSQL. La agenda del tutor también consulta reservas reales. Otros módulos, incluidos
notificaciones y cierre de sesiones, aún usan datos simulados y sus cambios
se pierden al reiniciar el servidor. Mantén `NEXT_PUBLIC_DATOS_SIMULADOS=true`
hasta que sus contratos estén implementados. La recuperación de contraseña
todavía no está disponible.

## Verificar

```bash
npm test
npm run lint
npm run build
```

La [documentación del backend](backend/README.md) incluye la estructura de
carpetas, configuración, endpoints, migraciones y pruebas de integración. El
[recorrido de demostración](CUENTAS-DEMO.md) describe los flujos del frontend.
