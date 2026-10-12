"use server";

import { revalidatePath } from "next/cache";
import { usuarioActual } from "@/features/auth/sesion";
import {
  aIsoFechaHora,
  calcularTurnos,
} from "@/features/disponibilidad/calcular-turnos";
import { disponibilidadRepo } from "@/features/disponibilidad";
import {
  notificacionesRepo,
  type NuevaNotificacion,
} from "@/features/notificaciones";
import { nombreEstudiante } from "@/mocks/estudiantes";
import { reservasRepo } from "./index";
import {
  ETIQUETA_ESTADO,
  type EstadoReserva,
  type NuevaReserva,
  type Reserva,
} from "./reserva.types";

export type ResultadoReserva =
  { ok: true; reserva: Reserva } | { ok: false; mensaje: string };

/**
 * Crea una reserva (F3.5).
 *
 * Antes de guardar vuelve a pedir los turnos y comprueba que el elegido siga
 * libre. El navegador ya lo mostró como disponible, pero entre que se eligió
 * y se confirmó pudo pasar cualquier cosa: la interfaz propone, el servidor
 * dispone.
 */
export async function crearReserva(
  nueva: NuevaReserva,
): Promise<ResultadoReserva> {
  const usuario = await usuarioActual();
  if (
    !usuario ||
    usuario.rol !== "estudiante" ||
    usuario.id !== nueva.estudianteId
  ) {
    return {
      ok: false,
      mensaje: "Inicia sesión como estudiante para reservar.",
    };
  }
  if (!nueva.inicio || !nueva.fin || nueva.inicio >= nueva.fin) {
    return {
      ok: false,
      mensaje: "El horario elegido no es válido. Vuelve a elegirlo.",
    };
  }

  if (nueva.modalidad === "presencial" && !nueva.lugar?.trim()) {
    return {
      ok: false,
      mensaje:
        "Escribe el punto de encuentro para poder reservar una sesión presencial.",
    };
  }

  const fecha = nueva.inicio.slice(0, 10);
  const dias = await disponibilidadRepo.turnos({
    tutorId: nueva.tutorId,
    desde: fecha,
    dias: 1,
    duracionMinutos: nueva.duracionMinutos,
  });

  const sigueLibre = dias
    .flatMap((dia) => dia.turnos)
    .some((turno) => turno.inicio === nueva.inicio && turno.fin === nueva.fin);

  if (!sigueLibre) {
    return {
      ok: false,
      mensaje:
        "Ese turno ya no está disponible. Elige otro horario y vuelve a intentarlo.",
    };
  }

  try {
    const reserva = await reservasRepo.crear(nueva);

    await notificacionesRepo.crear({
      destinatarioId: reserva.tutorId,
      tipo: "reserva-nueva",
      titulo: "Nueva solicitud de tutoría",
      detalle: `${nombreEstudiante(reserva.estudianteId)} pidió una sesión el ${reserva.inicio.slice(0, 10)} a las ${reserva.inicio.slice(11, 16)}.`,
      enlace: "/tutor/solicitudes",
    });

    revalidatePath("/estudiante");
    revalidatePath("/estudiante/reservas");
    revalidatePath("/tutor");
    revalidatePath("/tutor/solicitudes");

    return { ok: true, reserva };
  } catch (error) {
    return {
      ok: false,
      mensaje:
        error instanceof Error ? error.message : "No pudimos crear la reserva.",
    };
  }
}

/**
 * Transiciones válidas del ciclo de vida.
 *
 * Está aquí y no en la interfaz a propósito: los botones que se muestran son
 * una comodidad, la regla de qué se puede hacer vive en el servidor. Una
 * petición que intente saltarse el ciclo se rechaza aunque no exista botón.
 */
const TRANSICIONES: Record<EstadoReserva, EstadoReserva[]> = {
  pendiente: ["aceptada", "rechazada", "cancelada"],
  aceptada: ["en-curso", "cancelada", "finalizada"],
  "en-curso": ["finalizada"],
  rechazada: [],
  finalizada: [],
  cancelada: [],
};

function refrescar() {
  revalidatePath("/estudiante");
  revalidatePath("/estudiante/reservas");
  revalidatePath("/tutor");
  revalidatePath("/tutor/solicitudes");
  revalidatePath("/tutor/agenda");
  revalidatePath("/notificaciones");
}

async function cambiar(
  id: string,
  estado: EstadoReserva,
  motivo?: string,
): Promise<ResultadoReserva> {
  const actual = await reservasRepo.obtener(id);
  if (!actual) return { ok: false, mensaje: "No encontramos esa reserva." };
  const usuario = await usuarioActual();
  const autorizado =
    estado === "cancelada"
      ? usuario?.rol === "estudiante" && usuario.id === actual.estudianteId
      : usuario?.rol === "tutor" && usuario.id === actual.tutorId;
  if (!autorizado)
    return {
      ok: false,
      mensaje: "No tienes permiso para cambiar esta reserva.",
    };

  if (!TRANSICIONES[actual.estado].includes(estado)) {
    return {
      ok: false,
      mensaje: `Una reserva ${ETIQUETA_ESTADO[actual.estado].toLowerCase()} ya no se puede cambiar.`,
    };
  }

  const reserva = await reservasRepo.cambiarEstado(id, estado, motivo);
  await avisar(reserva, motivo);
  refrescar();

  return { ok: true, reserva };
}

/**
 * Cada cambio de estado deja un aviso a la contraparte.
 *
 * Quien provocó el cambio ya lo sabe: si el tutor acepta, el aviso es para el
 * estudiante; si el estudiante cancela, para el tutor.
 */
async function avisar(reserva: Reserva, motivo?: string) {
  const cuando = `${reserva.inicio.slice(0, 10)} a las ${reserva.inicio.slice(11, 16)}`;

  const avisos: Partial<Record<EstadoReserva, NuevaNotificacion>> = {
    aceptada: {
      destinatarioId: reserva.estudianteId,
      tipo: "reserva-aceptada",
      titulo: "Tu sesión fue aceptada",
      detalle: `Quedó confirmada para el ${cuando}.`,
      enlace: `/estudiante/reservas/${reserva.id}`,
    },
    rechazada: {
      destinatarioId: reserva.estudianteId,
      tipo: "reserva-rechazada",
      titulo: "El tutor no pudo tomar tu sesión",
      detalle: motivo ?? `La sesión del ${cuando} no se pudo confirmar.`,
      enlace: `/estudiante/reservas/${reserva.id}`,
    },
    cancelada: {
      destinatarioId: reserva.tutorId,
      tipo: "reserva-cancelada",
      titulo: "Se canceló una sesión",
      detalle: `${nombreEstudiante(reserva.estudianteId)} canceló la sesión del ${cuando}.`,
      enlace: "/tutor/agenda",
    },
    finalizada: {
      destinatarioId: reserva.estudianteId,
      tipo: "sesion-finalizada",
      titulo: "¿Cómo te fue en la sesión?",
      detalle:
        "Califica a tu tutor: tu reseña ayuda a los siguientes estudiantes.",
      enlace: `/estudiante/reservas/${reserva.id}`,
    },
  };

  const aviso = avisos[reserva.estado];
  if (aviso) await notificacionesRepo.crear(aviso);
}

/** El tutor acepta la solicitud (F5.5). */
export async function aceptarReserva(id: string) {
  return cambiar(id, "aceptada");
}

/** El tutor la rechaza; el motivo es obligatorio para que el estudiante sepa por qué. */
export async function rechazarReserva(id: string, motivo: string) {
  if (!motivo.trim()) {
    return {
      ok: false as const,
      mensaje: "Escribe un motivo para que el estudiante lo entienda.",
    };
  }
  return cambiar(id, "rechazada", motivo.trim());
}

/** Cancelación por parte del estudiante (F3.8). */
export async function cancelarReserva(id: string, motivo?: string) {
  return cambiar(id, "cancelada", motivo);
}

/** Cierre de la sesión (F7.6 en su versión mínima). */
export async function finalizarReserva(id: string) {
  return cambiar(id, "finalizada");
}

/**
 * Cierre de la sesión por el tutor (F7.6).
 *
 * Es lo que convierte una sesión aceptada en finalizada, y por tanto lo que
 * habilita la reseña. Si el estudiante no asistió queda registrada igual,
 * pero sin derecho a calificar: no hubo clase que juzgar.
 */
export async function cerrarSesionTutoria(datos: {
  reservaId: string;
  asistio: boolean;
  duracionReal: number;
  observaciones?: string;
}): Promise<ResultadoReserva> {
  const reserva = await reservasRepo.obtener(datos.reservaId);
  if (!reserva) return { ok: false, mensaje: "No encontramos esa sesión." };
  const usuario = await usuarioActual();
  if (!usuario || usuario.rol !== "tutor" || usuario.id !== reserva.tutorId) {
    return {
      ok: false,
      mensaje: "Solo el tutor de esta sesión puede cerrarla.",
    };
  }

  if (reserva.estado !== "aceptada" && reserva.estado !== "en-curso") {
    return {
      ok: false,
      mensaje: "Solo se cierra una sesión que estaba confirmada.",
    };
  }

  if (
    !Number.isFinite(datos.duracionReal) ||
    datos.duracionReal < 0 ||
    datos.duracionReal > 480 ||
    (datos.asistio && datos.duracionReal <= 0)
  ) {
    return {
      ok: false,
      mensaje: "Si el estudiante asistió, la duración no puede ser cero.",
    };
  }

  await reservasRepo.registrarCierre(datos.reservaId, {
    asistio: datos.asistio,
    duracionReal: datos.duracionReal,
    observaciones: datos.observaciones,
  });

  return cambiar(datos.reservaId, "finalizada");
}

/** Consulta para mover una reserva: su propio turno no bloquea la elección. */
export async function turnosParaReprogramar(
  reservaId: string,
  desde: string,
  dias: number,
) {
  const usuario = await usuarioActual();
  const reserva = await reservasRepo.obtener(reservaId);
  if (
    !usuario ||
    usuario.rol !== "estudiante" ||
    reserva?.estudianteId !== usuario.id
  ) {
    throw new Error("No tienes permiso para reprogramar esta reserva.");
  }
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(desde) ||
    !Number.isInteger(dias) ||
    dias < 1 ||
    dias > 60
  ) {
    throw new Error("El rango de fechas no es válido.");
  }
  const [disponibilidad, reservas] = await Promise.all([
    disponibilidadRepo.obtener(reserva.tutorId),
    reservasRepo.deTutor(reserva.tutorId),
  ]);
  return calcularTurnos({
    disponibilidad,
    desde,
    dias,
    duracionMinutos: reserva.duracionMinutos,
    ocupados: reservas.filter(
      (otra) =>
        otra.id !== reservaId &&
        ["pendiente", "aceptada", "en-curso"].includes(otra.estado),
    ),
  });
}

export async function reprogramarReserva(
  reservaId: string,
  inicio: string,
  fin: string,
): Promise<ResultadoReserva> {
  try {
    const usuario = await usuarioActual();
    const reserva = await reservasRepo.obtener(reservaId);
    if (
      !usuario ||
      usuario.rol !== "estudiante" ||
      reserva?.estudianteId !== usuario.id
    ) {
      return {
        ok: false,
        mensaje: "No tienes permiso para reprogramar esta reserva.",
      };
    }
    if (
      !["pendiente", "aceptada"].includes(reserva.estado) ||
      reserva.inicio <= aIsoFechaHora(new Date())
    ) {
      return {
        ok: false,
        mensaje: "Solo puedes reprogramar una sesión futura que siga activa.",
      };
    }
    if (inicio === reserva.inicio)
      return { ok: false, mensaje: "Elige un horario diferente al actual." };
    const dias = await turnosParaReprogramar(reservaId, inicio.slice(0, 10), 1);
    if (
      !dias
        .flatMap((dia) => dia.turnos)
        .some((turno) => turno.inicio === inicio && turno.fin === fin)
    ) {
      return {
        ok: false,
        mensaje: "Ese turno ya no está disponible. Elige otro.",
      };
    }
    const actualizada = await reservasRepo.reprogramar(
      reservaId,
      inicio,
      fin,
      reserva.inicio,
    );
    await notificacionesRepo.crear({
      destinatarioId: reserva.tutorId,
      tipo: "reserva-reprogramada",
      titulo: "Solicitud de nuevo horario",
      detalle: `La reserva ${reservaId} se movió al ${inicio.slice(0, 10)} a las ${inicio.slice(11)}. Confirma el nuevo turno.`,
      enlace: "/tutor/solicitudes",
    });
    refrescar();
    revalidatePath(`/estudiante/reservas/${reservaId}`);
    revalidatePath(`/sesion/${reservaId}`);
    return { ok: true, reserva: actualizada };
  } catch (error) {
    return {
      ok: false,
      mensaje:
        error instanceof Error
          ? error.message
          : "No pudimos cambiar el horario. Inténtalo de nuevo.",
    };
  }
}
