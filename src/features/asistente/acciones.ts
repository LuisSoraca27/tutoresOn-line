"use server";

import { catalogosRepo } from "@/features/catalogos";
import { tutoresRepo, type Tutor } from "@/features/tutores";
import { asistenteRepo } from "./index";
import type { Mensaje, RespuestaAsistente } from "./asistente.types";

export interface TurnoAsistente {
  respuesta: RespuestaAsistente;
  /** Los tutores completos, para pintarlos sin otra vuelta al servidor. */
  tutores: Tutor[];
  nombresMateria: Record<string, string>;
  nombresCiudad: Record<string, string>;
}

/**
 * Un turno de conversación con el asistente (F10.1, F10.2).
 *
 * Devuelve la respuesta y los tutores ya resueltos: el navegador no tiene que
 * encadenar dos peticiones para poder pintar una tarjeta.
 */
export async function preguntarAlAsistente(
  consulta: string,
  historial: Mensaje[],
): Promise<TurnoAsistente> {
  const respuesta = await asistenteRepo.emparejar(consulta, historial);

  const [tutores, materias, ciudades] = await Promise.all([
    Promise.all(respuesta.tutorIds.map((id) => tutoresRepo.obtener(id))),
    catalogosRepo.materias(),
    catalogosRepo.ciudades(),
  ]);

  return {
    respuesta,
    tutores: tutores.filter((tutor): tutor is Tutor => tutor !== null),
    nombresMateria: Object.fromEntries(materias.map((m) => [m.id, m.nombre])),
    nombresCiudad: Object.fromEntries(ciudades.map((c) => [c.id, c.nombre])),
  };
}
