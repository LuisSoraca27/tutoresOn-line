# Cuentas de demostración

Estas cuentas existen solo mientras la aplicación corre con datos simulados
(`NEXT_PUBLIC_DATOS_SIMULADOS=true`). Están sembradas en
[`src/mocks/cuentas.ts`](src/mocks/cuentas.ts) y entran por el mismo formulario
de login que cualquier otra: se valida la contraseña y se deja la misma cookie
de sesión. Contra el backend real no existen y el panel no se pinta.

**Contraseña de las dos: `demo1234`**

| Correo | Rol | Nombre | Panel al entrar |
| --- | --- | --- | --- |
| `sara@ejemplo.co` | Estudiante | Sara Betancur | `/estudiante` |
| `mariana@ejemplo.co` | Tutor | Mariana Restrepo | `/tutor` |

## Para la sustentación

1. Abre `/auth/login`.
2. Escribe el correo de la cuenta que quieras mostrar y `demo1234`.
3. El rol lo decide la cuenta, no el formulario: cada una cae en su propio
   panel y el menú lateral cambia con ella.

Los datos que ve cada cuenta —reservas, agenda, reseñas, avisos— viven en
memoria del proceso (`src/mocks/almacen.ts`) y se reinician al reiniciar el
servidor. Es a propósito: cada demostración empieza desde el mismo estado.

## Recorrido de entrega

1. Como Sara, abre una reserva futura y usa **Reprogramar sesión**. Confirma
   otro horario; conserva el precio y queda pendiente de aceptación.
2. Desde **Mis reservas**, abre una sesión finalizada: puedes guardar y
   descargar apuntes privados, o conversar con el tutor desde su sala.
3. Como Mariana, entra a **Mensajes** para responder a Sara; los mensajes se
   actualizan cada cinco segundos. Los apuntes de Sara no son visibles allí.
4. En **Ingresos**, filtra fechas y descarga CSV o comprobantes. Solicita un
   retiro con un destino de prueba y cancélalo para recuperar el saldo.
5. En **Mi perfil público**, configura los canales de avisos y carga una foto
   pequeña. Los avisos de la cuenta muestran las entregas simuladas por canal.
6. Desde el login, prueba **Olvidé mi contraseña**. En demo se abre el enlace
   mostrado en pantalla, sin enviar correo. Si cambias la clave, usa la nueva
   hasta reiniciar el servidor; el enlace vence y no admite un segundo uso.

Los retiros y las entregas externas son simulados; este recorrido no realiza
transferencias ni envía correo, SMS o WhatsApp.

## Cambiar o agregar una cuenta

Agrega una entrada más al arreglo `CUENTAS` de
[`src/mocks/cuentas.ts`](src/mocks/cuentas.ts) y actualiza la tabla de arriba.
El `id` tiene que coincidir con el que usan los datos simulados (`e-001` para
la estudiante, `t-001` para la tutora); si no, la cuenta entra pero su panel
aparece vacío.
