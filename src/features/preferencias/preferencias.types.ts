/**
 * Preferencias de notificación (F9.4).
 *
 * El alcance del proyecto pide enviar el registro de la tutoría por correo,
 * SMS o WhatsApp. Quién recibe qué por dónde se decide aquí; el envío lo
 * hará FastAPI a partir del mismo evento que ya genera los avisos dentro de
 * la aplicación.
 */
export type Canal = "correo" | "sms" | "whatsapp";

export type EventoNotificable =
  | "reserva-confirmada"
  | "recordatorio-sesion"
  | "cambio-de-estado"
  | "resumen-sesion";

export interface Preferencias {
  usuarioId: string;
  /** Por cada evento, en qué canales quiere recibirlo. */
  canales: Record<EventoNotificable, Canal[]>;
}

export const CANALES: { id: Canal; etiqueta: string }[] = [
  { id: "correo", etiqueta: "Correo" },
  { id: "sms", etiqueta: "SMS" },
  { id: "whatsapp", etiqueta: "WhatsApp" },
];

export const EVENTOS: { id: EventoNotificable; etiqueta: string; detalle: string }[] = [
  {
    id: "reserva-confirmada",
    etiqueta: "Reserva confirmada",
    detalle: "Cuando el tutor acepta tu solicitud.",
  },
  {
    id: "recordatorio-sesion",
    etiqueta: "Recordatorio de sesión",
    detalle: "Una hora antes de empezar, con el enlace de la sala.",
  },
  {
    id: "cambio-de-estado",
    etiqueta: "Cambios y cancelaciones",
    detalle: "Si una sesión se cancela o se rechaza.",
  },
  {
    id: "resumen-sesion",
    etiqueta: "Registro de la tutoría",
    detalle: "El resumen de lo visto cuando el tutor cierra la sesión.",
  },
];

/** Por defecto todo por correo: es el canal que siempre existe. */
export const PREFERENCIAS_POR_DEFECTO: Preferencias["canales"] = {
  "reserva-confirmada": ["correo"],
  "recordatorio-sesion": ["correo"],
  "cambio-de-estado": ["correo"],
  "resumen-sesion": ["correo"],
};
