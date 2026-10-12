"use server";

import { revalidatePath } from "next/cache";
import { notificacionesRepo } from "@/features/notificaciones";
import { reservasRepo } from "@/features/reservas";
import { nombreEstudiante } from "@/mocks/estudiantes";
import { resenasRepo } from "./index";
import type { Resena } from "./resena.types";

export type ResultadoResena = { ok: true; resena: Resena } | { ok: false; mensaje: string };

/**
 * Publicar una reseña (F8.1).
 *
 * Solo se puede calificar una sesión finalizada y solo quien la tomó. Se
 * comprueba aquí, contra la reserva, y no en la interfaz: la regla es lo que
 * hace que la reputación signifique algo.
 */
export async function publicarResena(datos: {
  reservaId: string;
  estudianteId: string;
  puntaje: number;
  comentario: string;
  criterios?: { puntualidad: number; claridad: number; dominio: number };
}): Promise<ResultadoResena> {
  const reserva = await reservasRepo.obtener(datos.reservaId);

  if (!reserva || reserva.estudianteId !== datos.estudianteId) {
    return { ok: false, mensaje: "No encontramos esa sesión." };
  }

  if (reserva.estado !== "finalizada") {
    return { ok: false, mensaje: "Solo puedes calificar una sesión que ya terminó." };
  }

  if (datos.puntaje < 1 || datos.puntaje > 5) {
    return { ok: false, mensaje: "Elige entre una y cinco estrellas." };
  }

  if (datos.comentario.trim().length < 10) {
    return {
      ok: false,
      mensaje: "Escribe al menos una frase: un comentario corto no le sirve a nadie.",
    };
  }

  try {
    const resena = await resenasRepo.crear({
      reservaId: reserva.id,
      tutorId: reserva.tutorId,
      estudianteId: reserva.estudianteId,
      puntaje: datos.puntaje,
      comentario: datos.comentario.trim(),
      criterios: datos.criterios,
    });

    await notificacionesRepo.crear({
      destinatarioId: reserva.tutorId,
      tipo: "resena-nueva",
      titulo: `${nombreEstudiante(reserva.estudianteId)} te calificó`,
      detalle: `${datos.puntaje} de 5 estrellas. Puedes responder públicamente.`,
      enlace: "/tutor/resenas",
    });

    revalidatePath(`/tutores/${reserva.tutorId}`);
    revalidatePath(`/estudiante/reservas/${reserva.id}`);
    revalidatePath("/tutor/resenas");
    revalidatePath("/notificaciones");

    return { ok: true, resena };
  } catch (error) {
    return {
      ok: false,
      mensaje: error instanceof Error ? error.message : "No pudimos publicar la reseña.",
    };
  }
}

/** Respuesta pública del tutor (F8.6). */
export async function responderResena(id: string, texto: string): Promise<ResultadoResena> {
  if (texto.trim().length < 5) {
    return { ok: false, mensaje: "Escribe una respuesta un poco más larga." };
  }

  try {
    const resena = await resenasRepo.responder(id, texto.trim());

    await notificacionesRepo.crear({
      destinatarioId: resena.estudianteId,
      tipo: "resena-respondida",
      titulo: "Tu tutor respondió a tu reseña",
      detalle: texto.trim().slice(0, 90),
      enlace: `/tutores/${resena.tutorId}`,
    });

    revalidatePath(`/tutores/${resena.tutorId}`);
    revalidatePath("/tutor/resenas");
    revalidatePath("/notificaciones");

    return { ok: true, resena };
  } catch (error) {
    return {
      ok: false,
      mensaje: error instanceof Error ? error.message : "No pudimos guardar la respuesta.",
    };
  }
}

const MOTIVOS = [
  "Lenguaje ofensivo",
  "No corresponde a una sesión real",
  "Contiene datos personales",
  "Publicidad o spam",
] as const;

export async function motivosDeReporte(): Promise<readonly string[]> {
  return MOTIVOS;
}

/** Denunciar una reseña (F8.7). */
export async function reportarResena(id: string, motivo: string): Promise<ResultadoResena> {
  if (!MOTIVOS.includes(motivo as (typeof MOTIVOS)[number])) {
    return { ok: false, mensaje: "Elige un motivo de la lista." };
  }

  try {
    const resena = await resenasRepo.reportar(id, motivo);
    revalidatePath(`/tutores/${resena.tutorId}`);
    return { ok: true, resena };
  } catch (error) {
    return {
      ok: false,
      mensaje: error instanceof Error ? error.message : "No pudimos enviar el reporte.",
    };
  }
}
