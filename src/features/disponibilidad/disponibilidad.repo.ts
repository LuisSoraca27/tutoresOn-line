import type { DiaConTurnos, Disponibilidad, ReglasAgenda, BloqueSemanal, Excepcion } from "./disponibilidad.types";

export interface ConsultaTurnos {
  tutorId: string;
  /** "AAAA-MM-DD" */
  desde: string;
  dias: number;
  duracionMinutos: number;
}

export interface DisponibilidadRepo {
  obtener(tutorId: string): Promise<Disponibilidad>;
  guardarBloques(tutorId: string, bloques: BloqueSemanal[]): Promise<Disponibilidad>;
  guardarReglas(tutorId: string, reglas: ReglasAgenda): Promise<Disponibilidad>;
  guardarExcepciones(tutorId: string, excepciones: Excepcion[]): Promise<Disponibilidad>;
  /** Turnos libres, ya descontadas las reservas existentes. */
  turnos(consulta: ConsultaTurnos): Promise<DiaConTurnos[]>;
}
