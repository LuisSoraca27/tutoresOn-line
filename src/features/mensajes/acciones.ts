"use server";

import { revalidatePath } from "next/cache";
import { notificacionesRepo } from "@/features/notificaciones";
import { tutoresRepo } from "@/features/tutores";
import { nombreEstudiante } from "@/mocks/estudiantes";
import { mensajesRepo } from "./index";
import { usuarioActual } from "@/features/auth/sesion";
import { reservasRepo } from "@/features/reservas";
import type { ConversacionConMensajes } from "./mensajes.repo";

/** Abre un hilo y lo da por leído para quien lo abre. */
export async function consultarHilo(
  estudianteId: string,
  tutorId: string,
  lectorId: string,
): Promise<ConversacionConMensajes> {
  await comprobarParticipante(estudianteId, tutorId, lectorId);
  const hilo = await mensajesRepo.hilo(estudianteId, tutorId);
  await mensajesRepo.marcarLeidos(hilo.conversacion.id, lectorId);
  return hilo;
}

export async function enviarMensaje(datos: {
  estudianteId: string;
  tutorId: string;
  autorId: string;
  texto: string;
}): Promise<{ ok: boolean; mensaje?: string }> {
  const texto = datos.texto.trim();

  if (!texto) return { ok: false, mensaje: "Escribe algo antes de enviar." };
  if (texto.length > 1000)
    return { ok: false, mensaje: "El mensaje es demasiado largo." };

  try {
    await comprobarParticipante(
      datos.estudianteId,
      datos.tutorId,
      datos.autorId,
    );

    await mensajesRepo.enviar({ ...datos, texto });

    // El aviso va para la contraparte, nunca para quien escribió.
    const esEstudiante = datos.autorId === datos.estudianteId;
    const tutor = await tutoresRepo.obtener(datos.tutorId);
    const remitente = esEstudiante
      ? nombreEstudiante(datos.estudianteId)
      : (tutor?.nombre ?? "tu tutor");

    await notificacionesRepo.crear({
      destinatarioId: esEstudiante ? datos.tutorId : datos.estudianteId,
      tipo: "mensaje-nuevo",
      titulo: `Mensaje de ${remitente}`,
      detalle: texto.slice(0, 90),
      enlace: esEstudiante ? "/tutor/mensajes" : "/estudiante/mensajes",
    });

    revalidatePath("/estudiante/mensajes");
    revalidatePath("/tutor/mensajes");
    revalidatePath("/notificaciones");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      mensaje:
        error instanceof Error
          ? error.message
          : "No pudimos enviar el mensaje. Inténtalo de nuevo.",
    };
  }
}

async function comprobarParticipante(
  estudianteId: string,
  tutorId: string,
  autorId: string,
) {
  const usuario = await usuarioActual();
  if (
    !usuario ||
    usuario.id !== autorId ||
    (usuario.rol === "estudiante"
      ? usuario.id !== estudianteId
      : usuario.id !== tutorId)
  ) {
    throw new Error("Tu sesión no permite acceder a esta conversación.");
  }
  const reservas = await reservasRepo.deEstudiante(estudianteId);
  if (!reservas.some((reserva) => reserva.tutorId === tutorId))
    throw new Error("Necesitas una reserva con este contacto para escribirle.");
}
