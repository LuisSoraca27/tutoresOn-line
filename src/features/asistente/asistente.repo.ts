import type { Mensaje, RespuestaAsistente } from "./asistente.types";

export interface AsistenteRepo {
  /**
   * Interpreta lo que escribió el estudiante y propone tutores.
   * El historial permite refinar: "mejor presencial" sobre una consulta previa.
   */
  emparejar(consulta: string, historial: Mensaje[]): Promise<RespuestaAsistente>;
}
