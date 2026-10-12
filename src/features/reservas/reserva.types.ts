import type { NivelId } from "@/features/catalogos/catalogo.types";
import type { Modalidad } from "@/features/tutores/tutor.types";

/**
 * Ciclo de vida de una reserva:
 *
 *   pendiente ──aceptar──▶ aceptada ──▶ en curso ──▶ finalizada
 *       │                     │
 *       ├──rechazar──▶ rechazada
 *       └──────────cancelar──────────▶ cancelada
 */
export type EstadoReserva =
  | "pendiente"
  | "aceptada"
  | "rechazada"
  | "en-curso"
  | "finalizada"
  | "cancelada";

export const ETIQUETA_ESTADO: Record<EstadoReserva, string> = {
  pendiente: "Pendiente de aceptación",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
  "en-curso": "En curso",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

export interface Reserva {
  id: string;
  tutorId: string;
  estudianteId: string;
  materiaId: string;
  nivelId: NivelId;
  modalidad: Exclude<Modalidad, "ambas">;
  /** "AAAA-MM-DDTHH:mm" en hora local del tutor. */
  inicio: string;
  fin: string;
  duracionMinutos: number;
  precio: number;
  estado: EstadoReserva;
  /** Punto de encuentro, solo para sesiones presenciales. */
  lugar?: string;
  notaEstudiante?: string;
  motivoRechazo?: string;
  /** Lo que registra el tutor al cerrar la sesión (F7.6). */
  cierre?: {
    asistio: boolean;
    duracionReal: number;
    observaciones?: string;
  };
  creadaEn: string;
}

/** Lo que envía el asistente de reserva. El resto lo calcula el repositorio. */
export type NuevaReserva = Omit<Reserva, "id" | "estado" | "creadaEn">;
