/**
 * Disponibilidad de un tutor (regla de negocio 4).
 *
 * Se modela en dos capas, como lo hace cualquier agenda real:
 *   1. un horario semanal que se repite,
 *   2. excepciones para días sueltos (vacaciones, un festivo, una cita).
 *
 * De ahí salen los turnos concretos que ve el estudiante al reservar.
 */

/** 0 = domingo … 6 = sábado, igual que `Date.getDay()`. */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DIAS: { id: DiaSemana; nombre: string; corto: string }[] = [
  { id: 1, nombre: "Lunes", corto: "Lun" },
  { id: 2, nombre: "Martes", corto: "Mar" },
  { id: 3, nombre: "Miércoles", corto: "Mié" },
  { id: 4, nombre: "Jueves", corto: "Jue" },
  { id: 5, nombre: "Viernes", corto: "Vie" },
  { id: 6, nombre: "Sábado", corto: "Sáb" },
  { id: 0, nombre: "Domingo", corto: "Dom" },
];

/** Franja del horario semanal. Las horas son "HH:mm" en la zona del tutor. */
export interface BloqueSemanal {
  id: string;
  dia: DiaSemana;
  inicio: string;
  fin: string;
}

/** Día concreto en el que el tutor no atiende. La fecha es "AAAA-MM-DD". */
export interface Excepcion {
  fecha: string;
  motivo?: string;
}

export interface ReglasAgenda {
  /** Duraciones que ofrece el tutor, en minutos. */
  duraciones: number[];
  /** Minutos de descanso entre una sesión y la siguiente. */
  descansoMinutos: number;
  /** Con cuánta antelación mínima se puede reservar. */
  antelacionHoras: number;
}

export interface Disponibilidad {
  tutorId: string;
  bloques: BloqueSemanal[];
  excepciones: Excepcion[];
  reglas: ReglasAgenda;
}

/** Turno concreto que el estudiante puede elegir. */
export interface Turno {
  /** "AAAA-MM-DDTHH:mm" en hora local del tutor. */
  inicio: string;
  fin: string;
  /** "HH:mm", para pintarlo sin volver a parsear. */
  horaInicio: string;
  horaFin: string;
}

export interface DiaConTurnos {
  /** "AAAA-MM-DD" */
  fecha: string;
  turnos: Turno[];
}

export const REGLAS_POR_DEFECTO: ReglasAgenda = {
  duraciones: [60, 90, 120],
  descansoMinutos: 15,
  antelacionHoras: 12,
};
