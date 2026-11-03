"use server";

import { CatalogosHttpRepo } from "@/features/catalogos/catalogos.http";
import { TutoresHttpRepo } from "@/features/tutores/tutores.http";
import type { Tutor } from "@/features/tutores";
import { asistenteRepo } from "./index";
import { usuarioActual } from "@/features/auth/sesion";
import { ErrorHttp } from "@/lib/http";
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
): Promise<{ ok: true; turno: TurnoAsistente } | { ok: false; mensaje: string }> {
  const usuario = await usuarioActual();
  if (!usuario || usuario.rol !== "estudiante") return { ok: false, mensaje: "Inicia sesión como estudiante para usar el asistente." };
  try {
  const respuesta = await asistenteRepo.emparejar(consulta, historial.slice(-20));
  const tutoresRepo = new TutoresHttpRepo();
  const catalogosRepo = new CatalogosHttpRepo();

  const [tutores, materias, ciudades] = await Promise.all([
    Promise.all(respuesta.tutorIds.map((id) => tutoresRepo.obtener(id))),
    catalogosRepo.materias(),
    catalogosRepo.ciudades(),
  ]);

  return {
    ok: true, turno: { respuesta,
    tutores: tutores.filter((tutor): tutor is Tutor => tutor !== null),
    nombresMateria: Object.fromEntries(materias.map((m) => [m.id, m.nombre])),
    nombresCiudad: Object.fromEntries(ciudades.map((c) => [c.id, c.nombre])) },
  };
  } catch (error) {
    return { ok: false, mensaje: error instanceof ErrorHttp ? error.message : "No pudimos consultar al asistente. Inténtalo de nuevo." };
  }
}
