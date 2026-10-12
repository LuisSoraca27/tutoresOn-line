/**
 * Mensajería directa entre estudiante y tutor (F9.6).
 *
 * Una conversación por pareja, no una por reserva: la pregunta típica
 * —si alcanzan a ver también otro tema, si se puede mover media hora—
 * pertenece a la relación entre los dos, no a una sesión concreta.
 */
export interface Mensaje {
  id: string;
  conversacionId: string;
  autorId: string;
  texto: string;
  enviadoEn: string;
  leido: boolean;
}

export interface Conversacion {
  id: string;
  estudianteId: string;
  tutorId: string;
  ultimoEn: string;
}

/** El identificador se deriva de la pareja: siempre el mismo para los dos. */
export function idConversacion(estudianteId: string, tutorId: string): string {
  return `${estudianteId}--${tutorId}`;
}
