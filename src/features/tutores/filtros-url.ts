import type { NivelId } from "@/features/catalogos/catalogo.types";
import type { FiltrosTutor, Modalidad, OrdenTutor } from "./tutor.types";

/**
 * La URL es la única fuente de verdad de la búsqueda.
 *
 * Así los resultados se pueden compartir por enlace, el botón "atrás" del
 * navegador funciona solo y la página se puede renderizar en el servidor
 * sin estado de cliente. Este módulo es puro: no toca React ni el router.
 */

export const POR_PAGINA = 9;
export const PRECIO_MINIMO = 20000;
export const PRECIO_MAXIMO = 80000;
export const PASO_PRECIO = 5000;

const MODALIDADES = ["virtual", "presencial", "ambas"] as const;
const ORDENES = ["relevancia", "precio-asc", "precio-desc", "calificacion", "sesiones"] as const;
const NIVELES = ["primaria", "bachillerato", "tecnico", "universitario", "posgrado"] as const;
const CALIFICACIONES = [4, 4.5, 4.8] as const;

export const ETIQUETA_ORDEN: Record<OrdenTutor, string> = {
  relevancia: "Más relevantes",
  calificacion: "Mejor calificados",
  "precio-asc": "Menor precio",
  "precio-desc": "Mayor precio",
  sesiones: "Más sesiones dictadas",
};

export const ETIQUETA_MODALIDAD: Record<Modalidad, string> = {
  ambas: "Cualquiera",
  virtual: "Virtual",
  presencial: "Presencial",
};

/** Lo que Next entrega en `searchParams`. */
export type ParametrosBusqueda = Record<string, string | string[] | undefined>;

function texto(valor: string | string[] | undefined): string | undefined {
  const crudo = Array.isArray(valor) ? valor[0] : valor;
  const limpio = crudo?.trim();
  return limpio ? limpio : undefined;
}

function numero(valor: string | string[] | undefined): number | undefined {
  const crudo = texto(valor);
  if (crudo === undefined) return undefined;
  const convertido = Number(crudo);
  return Number.isFinite(convertido) ? convertido : undefined;
}

function unoDe<T extends readonly string[]>(
  valor: string | string[] | undefined,
  permitidos: T,
): T[number] | undefined {
  const crudo = texto(valor);
  return crudo && (permitidos as readonly string[]).includes(crudo)
    ? (crudo as T[number])
    : undefined;
}

/**
 * Convierte los parámetros de la URL en filtros válidos.
 * Todo lo que no reconoce se descarta en silencio: una URL manipulada
 * devuelve una búsqueda razonable, nunca un error.
 */
export function leerFiltros(parametros: ParametrosBusqueda): FiltrosTutor {
  const pagina = numero(parametros.pagina);
  const precioMax = numero(parametros.precioMax);
  const calificacionMin = numero(parametros.calificacion);

  return {
    q: texto(parametros.q),
    materiaId: texto(parametros.materia),
    nivelId: unoDe(parametros.nivel, NIVELES) as NivelId | undefined,
    modalidad: unoDe(parametros.modalidad, MODALIDADES) as Modalidad | undefined,
    ciudadId: texto(parametros.ciudad),
    precioMax:
      precioMax !== undefined && precioMax >= PRECIO_MINIMO && precioMax < PRECIO_MAXIMO
        ? precioMax
        : undefined,
    calificacionMin: (CALIFICACIONES as readonly number[]).includes(calificacionMin ?? -1)
      ? calificacionMin
      : undefined,
    soloVerificados: texto(parametros.verificados) === "1" ? true : undefined,
    orden: (unoDe(parametros.orden, ORDENES) as OrdenTutor | undefined) ?? "relevancia",
    pagina: pagina !== undefined && pagina > 0 ? Math.floor(pagina) : 1,
    porPagina: POR_PAGINA,
  };
}

/** Reconstruye la cadena de consulta. Omite todo lo que esté en su valor por defecto. */
export function aQuery(filtros: FiltrosTutor): string {
  const parametros = new URLSearchParams();

  if (filtros.q) parametros.set("q", filtros.q);
  if (filtros.materiaId) parametros.set("materia", filtros.materiaId);
  if (filtros.nivelId) parametros.set("nivel", filtros.nivelId);
  if (filtros.modalidad && filtros.modalidad !== "ambas")
    parametros.set("modalidad", filtros.modalidad);
  if (filtros.ciudadId) parametros.set("ciudad", filtros.ciudadId);
  if (filtros.precioMax !== undefined) parametros.set("precioMax", String(filtros.precioMax));
  if (filtros.calificacionMin !== undefined)
    parametros.set("calificacion", String(filtros.calificacionMin));
  if (filtros.soloVerificados) parametros.set("verificados", "1");
  if (filtros.orden && filtros.orden !== "relevancia") parametros.set("orden", filtros.orden);
  if (filtros.pagina && filtros.pagina > 1) parametros.set("pagina", String(filtros.pagina));

  const cadena = parametros.toString();
  return cadena ? `?${cadena}` : "";
}

/** Los criterios que el usuario eligió, sin contar el orden ni la página. */
export function filtrosAplicados(filtros: FiltrosTutor): number {
  return [
    filtros.q,
    filtros.materiaId,
    filtros.nivelId,
    filtros.modalidad && filtros.modalidad !== "ambas" ? filtros.modalidad : undefined,
    filtros.ciudadId,
    filtros.precioMax,
    filtros.calificacionMin,
    filtros.soloVerificados,
  ].filter((valor) => valor !== undefined).length;
}

export const CALIFICACIONES_MINIMAS = CALIFICACIONES;
