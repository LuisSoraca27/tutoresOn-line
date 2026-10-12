# TutoresOn-Line · Frontend

Aplicación web de tutorías virtuales y presenciales, construida con Next.js,
React, TypeScript, HeroUI y Tailwind CSS.

Permite buscar tutores, reservar y reprogramar sesiones, gestionar agendas,
conversar, guardar apuntes, publicar reseñas y consultar ingresos.

## Ejecutar

Copia `.env.example` a `.env.local` y ejecuta:

```bash
npm ci
npm run dev
```

Abre [localhost:3000](http://localhost:3000). La aplicación funciona con datos
simulados y no necesita backend para la demostración.

## Cuentas demo

Contraseña para ambas: `demo1234`.

| Rol | Correo |
| --- | --- |
| Estudiante | `sara@ejemplo.co` |
| Tutor | `mariana@ejemplo.co` |

Los cambios se pierden al reiniciar el servidor. Los retiros y envíos de correo,
SMS o WhatsApp son simulados.

## Verificar

```bash
npm test
npm run lint
npm run build
```

Para conectar el backend, configura `NEXT_PUBLIC_API_URL` y cambia
`NEXT_PUBLIC_DATOS_SIMULADOS` a `false` en `.env.local`. La API debe implementar
los contratos de `src/features`.

Consulta el [recorrido de demostración](CUENTAS-DEMO.md) para presentar el proyecto.
