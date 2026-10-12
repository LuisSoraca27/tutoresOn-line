import type { NivelId } from "@/features/catalogos/catalogo.types";

/**
 * Tutor al instante (M4), el módulo opcional con puntos adicionales.
 *
 * Funciona como un viaje de Uber: el estudiante lanza una solicitud, los
 * tutores conectados la ven durante un rato, el primero que la toma se la
 * queda y el resto la pierde.
 *
 * En esta entrega el navegador pregunta cada pocos segundos. El tiempo real
 * de verdad son WebSockets en FastAPI: cambia el transporte, no la pantalla
 * ni estos tipos.
 */
export type EstadoSolicitud = "buscando" | "emparejada" | "cancelada" | "expirada";

export interface SolicitudExpress {
  id: string;
  estudianteId: string;
  materiaId: string;
  nivelId: NivelId;
  modalidad: "virtual" | "presencial";
  duracionMinutos: number;
  nota?: string;
  estado: EstadoSolicitud;
  /** Tutor que la aceptó, si alguno lo hizo. */
  tutorId?: string;
  /** Reserva creada al emparejar. */
  reservaId?: string;
  creadaEn: string;
}

export type NuevaSolicitud = Omit<
  SolicitudExpress,
  "id" | "estado" | "tutorId" | "reservaId" | "creadaEn"
>;

/** Cuánto vive una solicitud antes de darse por vencida. */
export const MINUTOS_VIGENCIA = 5;

/** Cada cuánto pregunta el navegador mientras busca. */
export const SEGUNDOS_SONDEO = 3;
