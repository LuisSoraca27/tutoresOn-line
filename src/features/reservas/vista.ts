import type { Ciudad, Materia, Nivel } from "@/features/catalogos";
import { aIsoFechaHora } from "@/features/disponibilidad/calcular-turnos";
import type { Tutor } from "@/features/tutores";
import { nombreEstudiante } from "@/mocks/estudiantes";
import type { Reserva } from "./reserva.types";

/**
 * Una reserva lista para pintar.
 *
 * Las pantallas necesitan nombres, no identificadores, y ese cruce se hacía
 * igual en cuatro pantallas distintas. Vive aquí, en el dominio y sin React,
 * para que la tabla del estudiante y la bandeja del tutor muestren lo mismo
 * de la misma forma.
 */
export interface ReservaVista extends Reserva {
  tutorNombre: string;
  estudianteNombre: string;
  materiaNombre: string;
  nivelNombre: string;
  ciudadNombre?: string;
  /** "AAAA-MM-DD" */
  fecha: string;
  horaInicio: string;
  horaFin: string;
  esFutura: boolean;
}

export interface Catalogo {
  tutores: Tutor[];
  materias: Materia[];
  niveles: Nivel[];
  ciudades?: Ciudad[];
}

export function aVista(reservas: Reserva[], catalogo: Catalogo): ReservaVista[] {
  const tutor = new Map(catalogo.tutores.map((item) => [item.id, item.nombre]));
  const materia = new Map(catalogo.materias.map((item) => [item.id, item.nombre]));
  const nivel = new Map(catalogo.niveles.map((item) => [item.id, item.nombre]));
  const ciudad = new Map((catalogo.ciudades ?? []).map((item) => [item.id, item.nombre]));
  const tutorCiudad = new Map(catalogo.tutores.map((item) => [item.id, item.ciudadId]));

  const ahora = aIsoFechaHora(new Date());

  return reservas.map((reserva) => {
    const ciudadId = tutorCiudad.get(reserva.tutorId);

    return {
      ...reserva,
      tutorNombre: tutor.get(reserva.tutorId) ?? reserva.tutorId,
      estudianteNombre: nombreEstudiante(reserva.estudianteId),
      materiaNombre: materia.get(reserva.materiaId) ?? reserva.materiaId,
      nivelNombre: nivel.get(reserva.nivelId) ?? reserva.nivelId,
      ciudadNombre: ciudadId ? ciudad.get(ciudadId) : undefined,
      fecha: reserva.inicio.slice(0, 10),
      horaInicio: reserva.inicio.slice(11, 16),
      horaFin: reserva.fin.slice(11, 16),
      esFutura: reserva.inicio >= ahora,
    };
  });
}

/** Estados que siguen vivos: aún puede pasar algo con ellos. */
const VIVOS = ["pendiente", "aceptada", "en-curso"] as const;

export interface ReservasAgrupadas {
  proximas: ReservaVista[];
  pasadas: ReservaVista[];
  canceladas: ReservaVista[];
}

/**
 * Reparte las reservas en las tres pestañas de "Mis reservas" (F6.2).
 *
 * Una sesión aceptada cuya hora ya pasó cuenta como pasada aunque nadie la
 * haya marcado como finalizada: el reloj no espera a que el tutor cierre.
 */
export function agrupar(reservas: ReservaVista[]): ReservasAgrupadas {
  const proximas: ReservaVista[] = [];
  const pasadas: ReservaVista[] = [];
  const canceladas: ReservaVista[] = [];

  for (const reserva of reservas) {
    if (reserva.estado === "cancelada" || reserva.estado === "rechazada") {
      canceladas.push(reserva);
    } else if (reserva.esFutura && (VIVOS as readonly string[]).includes(reserva.estado)) {
      proximas.push(reserva);
    } else {
      pasadas.push(reserva);
    }
  }

  proximas.sort((a, b) => a.inicio.localeCompare(b.inicio));
  pasadas.sort((a, b) => b.inicio.localeCompare(a.inicio));
  canceladas.sort((a, b) => b.inicio.localeCompare(a.inicio));

  return { proximas, pasadas, canceladas };
}

/** Agrupa por día, para la agenda del tutor. */
export function porDia(reservas: ReservaVista[]): { fecha: string; sesiones: ReservaVista[] }[] {
  const mapa = new Map<string, ReservaVista[]>();

  for (const reserva of [...reservas].sort((a, b) => a.inicio.localeCompare(b.inicio))) {
    const dia = mapa.get(reserva.fecha) ?? [];
    dia.push(reserva);
    mapa.set(reserva.fecha, dia);
  }

  return [...mapa.entries()].map(([fecha, sesiones]) => ({ fecha, sesiones }));
}
