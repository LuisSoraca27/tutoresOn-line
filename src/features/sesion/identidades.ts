import "server-only";

import { usuarioActual } from "@/features/auth/sesion";

/**
 * De quién son los datos que muestra una pantalla de panel.
 *
 * La respuesta sale de la cookie de sesión, no de una constante: desde el
 * módulo M1 quien entra como tutor ve su propia agenda, y quien acaba de
 * registrarse ve la suya, vacía.
 *
 * Las cuentas sembradas siguen aquí como respaldo para las pantallas que se
 * pueden abrir sin sesión iniciada —la sala de la tutoría en una demostración,
 * por ejemplo—. Cuando el backend exista y todas las rutas estén protegidas,
 * este respaldo se borra y el compilador señala qué quedaba dependiendo de él.
 */
export const TUTOR_DEMO = "t-001";
export const ESTUDIANTE_DEMO = "e-001";

/** El estudiante de la petición actual. */
export async function estudianteActual(): Promise<string> {
  const usuario = await usuarioActual();
  return usuario?.rol === "estudiante" ? usuario.id : ESTUDIANTE_DEMO;
}

/** El tutor de la petición actual. */
export async function tutorActual(): Promise<string> {
  const usuario = await usuarioActual();
  return usuario?.rol === "tutor" ? usuario.id : TUTOR_DEMO;
}
