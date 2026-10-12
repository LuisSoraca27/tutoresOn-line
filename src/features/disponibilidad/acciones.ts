"use server";

import { revalidatePath } from "next/cache";
import { disponibilidadRepo } from "./index";
import type { BloqueSemanal, Excepcion, ReglasAgenda } from "./disponibilidad.types";
import { aMinutos } from "./calcular-turnos";

/**
 * Acciones de servidor de la agenda.
 *
 * Los formularios del navegador nunca llaman al repositorio directamente:
 * pasan por aquí. Así la validación ocurre del lado del servidor —donde no
 * se puede saltar— y el día que entre FastAPI este archivo será el único
 * que cambie de destino.
 */

export interface Resultado {
  ok: boolean;
  mensaje?: string;
}

/** Un bloque tiene que empezar antes de terminar y no pisar a otro del mismo día. */
function validarBloques(bloques: BloqueSemanal[]): string | null {
  for (const bloque of bloques) {
    if (aMinutos(bloque.inicio) >= aMinutos(bloque.fin)) {
      return "Hay una franja que termina antes de empezar. Revisa las horas.";
    }
  }

  for (const dia of new Set(bloques.map((bloque) => bloque.dia))) {
    const delDia = bloques
      .filter((bloque) => bloque.dia === dia)
      .sort((a, b) => aMinutos(a.inicio) - aMinutos(b.inicio));

    for (let i = 1; i < delDia.length; i += 1) {
      if (aMinutos(delDia[i].inicio) < aMinutos(delDia[i - 1].fin)) {
        return "Dos franjas del mismo día se superponen. Sepáralas o únelas en una sola.";
      }
    }
  }

  return null;
}

export async function guardarBloques(
  tutorId: string,
  bloques: BloqueSemanal[],
): Promise<Resultado> {
  const error = validarBloques(bloques);
  if (error) return { ok: false, mensaje: error };

  await disponibilidadRepo.guardarBloques(tutorId, bloques);
  revalidatePath("/tutor/disponibilidad");

  return { ok: true, mensaje: "Horario guardado." };
}

export async function guardarReglas(tutorId: string, reglas: ReglasAgenda): Promise<Resultado> {
  if (reglas.duraciones.length === 0) {
    return { ok: false, mensaje: "Ofrece al menos una duración de sesión." };
  }

  await disponibilidadRepo.guardarReglas(tutorId, reglas);
  revalidatePath("/tutor/disponibilidad");

  return { ok: true, mensaje: "Reglas guardadas." };
}

export async function guardarExcepciones(
  tutorId: string,
  excepciones: Excepcion[],
): Promise<Resultado> {
  await disponibilidadRepo.guardarExcepciones(tutorId, excepciones);
  revalidatePath("/tutor/disponibilidad");

  return { ok: true, mensaje: "Días bloqueados actualizados." };
}

/**
 * Consulta de turnos desde el navegador.
 *
 * El asistente de reserva la llama cada vez que cambia la duración: los
 * turnos de 60 y de 90 minutos no caen en las mismas horas, así que el
 * calendario tiene que recalcularse entero.
 */
export async function consultarTurnos(consulta: {
  tutorId: string;
  desde: string;
  dias: number;
  duracionMinutos: number;
}) {
  return disponibilidadRepo.turnos(consulta);
}
