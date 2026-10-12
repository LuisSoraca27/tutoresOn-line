import type { FiltrosTutor } from "@/features/tutores";

/**
 * Asistente de emparejamiento (M10): el estudiante describe lo que necesita
 * en sus propias palabras y la plataforma le propone tutores.
 *
 * Es la funcionalidad con IA generativa del proyecto. Se eligió esta y no un
 * chat genérico porque resuelve un problema real y medible: quien llega
 * diciendo "me trabo con la regla de la cadena" no sabe que eso se llama
 * cálculo diferencial, y los filtros de la búsqueda le piden justo ese dato.
 */

export interface Mensaje {
  id: string;
  autor: "estudiante" | "asistente";
  texto: string;
  /** Lo que el asistente entendió, para poder mostrarlo y corregirlo. */
  filtros?: FiltrosTutor;
  /** Tutores propuestos en este turno. */
  tutorIds?: string[];
  /** Preguntas sugeridas para seguir la conversación. */
  seguimientos?: string[];
}

export interface RespuestaAsistente {
  texto: string;
  filtros: FiltrosTutor;
  tutorIds: string[];
  seguimientos: string[];
  /** Qué pistas encontró en el texto; se muestran como etiquetas. */
  entendido: { campo: string; valor: string }[];
}
