"use server";

import { revalidatePath } from "next/cache";
import { notificacionesRepo } from "@/features/notificaciones";
import { reservasRepo } from "@/features/reservas";
import { tutoresRepo, type Tutor } from "@/features/tutores";
import { nombreEstudiante } from "@/mocks/estudiantes";
import { expressRepo } from "./index";
import type { NuevaSolicitud, SolicitudExpress } from "./express.types";

export type ResultadoExpress =
  | { ok: true; solicitud: SolicitudExpress }
  | { ok: false; mensaje: string };

/** Lanzar la búsqueda (F4.2). */
export async function lanzarBusqueda(nueva: NuevaSolicitud): Promise<ResultadoExpress> {
  try {
    const solicitud = await expressRepo.crear(nueva);
    revalidatePath("/tutor");
    return { ok: true, solicitud };
  } catch (error) {
    return {
      ok: false,
      mensaje: error instanceof Error ? error.message : "No pudimos lanzar la búsqueda.",
    };
  }
}

export interface EstadoBusqueda {
  solicitud: SolicitudExpress | null;
  /** Tutores conectados que encajan, para mostrar a quién se le está avisando. */
  candidatos: { id: string; nombre: string }[];
  /** El que aceptó, cuando ya hay emparejamiento. */
  tutor: Tutor | null;
}

/**
 * Estado de la búsqueda (F4.3).
 *
 * El navegador la llama cada pocos segundos. Con FastAPI esto será un
 * WebSocket y la pantalla no cambia: la misma forma de datos, empujada en
 * vez de pedida.
 */
export async function consultarBusqueda(id: string): Promise<EstadoBusqueda> {
  const solicitud = await expressRepo.obtener(id);
  if (!solicitud) return { solicitud: null, candidatos: [], tutor: null };

  if (solicitud.estado === "emparejada" && solicitud.tutorId) {
    return {
      solicitud,
      candidatos: [],
      tutor: await tutoresRepo.obtener(solicitud.tutorId),
    };
  }

  const pagina = await tutoresRepo.buscar({
    materiaId: solicitud.materiaId,
    nivelId: solicitud.nivelId,
    modalidad: solicitud.modalidad,
    porPagina: 8,
  });

  return {
    solicitud,
    candidatos: pagina.items
      .filter((tutor) => tutor.disponibleAhora)
      .map((tutor) => ({ id: tutor.id, nombre: tutor.nombre })),
    tutor: null,
  };
}

/** Cancelar la búsqueda (F4.6). */
export async function cancelarBusqueda(id: string): Promise<ResultadoExpress> {
  try {
    return { ok: true, solicitud: await expressRepo.cancelar(id) };
  } catch (error) {
    return {
      ok: false,
      mensaje: error instanceof Error ? error.message : "No pudimos cancelar la búsqueda.",
    };
  }
}

/**
 * El tutor toma la solicitud (F4.4, F4.7).
 *
 * Crea la reserva ya aceptada —no pendiente: aceptarla *es* tomarla— y la
 * agenda para dentro de cinco minutos, que es lo que tarda alguien en
 * sentarse frente al computador.
 */
export async function tomarSolicitud(
  solicitudId: string,
  tutorId: string,
): Promise<ResultadoExpress> {
  const solicitud = await expressRepo.obtener(solicitudId);
  if (!solicitud) return { ok: false, mensaje: "Esa solicitud ya no existe." };

  if (solicitud.estado !== "buscando") {
    return { ok: false, mensaje: "Otro tutor la tomó primero." };
  }

  const tutor = await tutoresRepo.obtener(tutorId);
  if (!tutor) return { ok: false, mensaje: "No encontramos tu perfil." };

  const dictada = tutor.materias.find((materia) => materia.materiaId === solicitud.materiaId);
  const precio = Math.round(
    ((dictada?.precioHora ?? tutor.precioDesde) * solicitud.duracionMinutos) / 60,
  );

  const inicio = new Date(Date.now() + 5 * 60 * 1000);
  const fin = new Date(inicio.getTime() + solicitud.duracionMinutos * 60 * 1000);

  try {
    const reserva = await reservasRepo.crear({
      tutorId,
      estudianteId: solicitud.estudianteId,
      materiaId: solicitud.materiaId,
      nivelId: solicitud.nivelId,
      modalidad: solicitud.modalidad,
      inicio: aLocal(inicio),
      fin: aLocal(fin),
      duracionMinutos: solicitud.duracionMinutos,
      precio,
      notaEstudiante: solicitud.nota,
    });

    await reservasRepo.cambiarEstado(reserva.id, "aceptada");
    const actualizada = await expressRepo.emparejar(solicitudId, tutorId, reserva.id);

    await notificacionesRepo.crear({
      destinatarioId: solicitud.estudianteId,
      tipo: "reserva-aceptada",
      titulo: `${tutor.nombre} tomó tu solicitud`,
      detalle: `La sesión empieza en cinco minutos. Entra cuando quieras.`,
      enlace: `/sesion/${reserva.id}`,
    });

    revalidatePath("/tutor");
    revalidatePath("/tutor/agenda");
    revalidatePath("/estudiante");

    return { ok: true, solicitud: actualizada };
  } catch (error) {
    return {
      ok: false,
      mensaje: error instanceof Error ? error.message : "No pudimos tomar la solicitud.",
    };
  }
}

/** Solicitudes vivas que le sirven a un tutor conectado (F4.4). */
export async function solicitudesParaTutor(tutorId: string) {
  const solicitudes = await expressRepo.paraTutor(tutorId);

  return solicitudes.map((solicitud) => ({
    ...solicitud,
    estudianteNombre: nombreEstudiante(solicitud.estudianteId),
  }));
}

/** "2026-08-29T14:05" en hora local, que es como guarda todo el dominio. */
function aLocal(fecha: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}T${p(fecha.getHours())}:${p(fecha.getMinutes())}`;
}
