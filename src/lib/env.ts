/**
 * Único punto donde el frontend lee variables de entorno.
 * Nada más en el proyecto debe tocar `process.env` directamente.
 */
export const env = {
  /** URL base de la API de FastAPI. */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",

  /**
   * Con `true` la app usa los repositorios simulados de `features/*.mock.ts`.
   * Es el interruptor que permite construir y sustentar el frontend
   * antes de que exista el backend (principio D de SOLID).
   */
  usarDatosSimulados:
    (process.env.NEXT_PUBLIC_DATOS_SIMULADOS ?? "true") === "true",
} as const;
