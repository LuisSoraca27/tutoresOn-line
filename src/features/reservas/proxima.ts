import type { ReservaEstudiante } from "./reales";

/** Las fechas del API están expresadas en hora de Bogotá. */
export function proximaReserva(reservas: ReservaEstudiante[], ahora: Date = new Date()): ReservaEstudiante | undefined {
  return reservas
    .filter((r) => ["pendiente", "aceptada", "en-curso"].includes(r.estado) && new Date(`${r.fin}:00-05:00`).getTime() > ahora.getTime())
    .sort((a, b) => a.inicio.localeCompare(b.inicio))[0];
}
