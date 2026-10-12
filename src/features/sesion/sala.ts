import type { Reserva } from "@/features/reservas";

/**
 * La sala de videoconferencia (F7.2).
 *
 * Decisión del proyecto: Jitsi Meet. Google Meet y Teams exigen credenciales
 * de organización y consentimiento OAuth de cada usuario, lo que no se puede
 * montar ni sustentar en un proyecto de aula. Jitsi crea la sala con solo
 * visitar la dirección, no pide cuenta y funciona el día de la demostración.
 *
 * El nombre de la sala se deriva del código de la reserva, que ya es único,
 * así que tutor y estudiante llegan al mismo sitio sin coordinar nada.
 */
export function enlaceSala(reserva: Pick<Reserva, "id">): string {
  return `https://meet.jit.si/tutores-online-${reserva.id.toLowerCase()}`;
}

/** Minutos antes del inicio en los que ya se puede entrar. */
export const MINUTOS_ANTES = 10;

/**
 * Estado de la sala en un momento dado. Se calcula igual en el servidor y en
 * el navegador, por eso recibe el "ahora" en vez de leerlo.
 */
export type EstadoSala = "lejos" | "abierta" | "en-curso" | "terminada";

export function estadoSala(reserva: Reserva, ahora: Date): EstadoSala {
  const inicio = new Date(reserva.inicio).getTime();
  const fin = new Date(reserva.fin).getTime();
  const momento = ahora.getTime();

  if (momento >= fin) return "terminada";
  if (momento >= inicio) return "en-curso";
  if (momento >= inicio - MINUTOS_ANTES * 60 * 1000) return "abierta";
  return "lejos";
}
