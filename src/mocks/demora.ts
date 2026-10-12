/**
 * Simula la latencia de red para que los esqueletos de carga se vean
 * y se prueben desde el primer día, no solo cuando el backend esté listo.
 */
export const demora = (ms = 350) => new Promise<void>((listo) => setTimeout(listo, ms));
