/**
 * Avisos dentro de la aplicación (F9.1, F9.2).
 *
 * Los genera el servidor cuando pasa algo, no el navegador: el estudiante
 * tiene que enterarse de que le aceptaron la sesión aunque tuviera la pestaña
 * cerrada. El correo, el SMS y el WhatsApp del alcance salen del mismo
 * evento; eso lo hará FastAPI.
 */
export type TipoNotificacion =
  | "reserva-nueva"
  | "reserva-aceptada"
  | "reserva-rechazada"
  | "reserva-cancelada"
  | "reserva-reprogramada"
  | "mensaje-nuevo"
  | "sesion-finalizada"
  | "resena-nueva"
  | "resena-respondida";

export interface EntregaNotificacion {
  canal: "correo" | "sms" | "whatsapp";
  estado: "simulado" | "pendiente" | "enviado" | "fallido";
  detalle?: string;
}

export interface Notificacion {
  id: string;
  /** A quién le llega: un id de estudiante o de tutor. */
  destinatarioId: string;
  tipo: TipoNotificacion;
  titulo: string;
  detalle: string;
  /** A dónde lleva al tocarla. */
  enlace: string;
  leida: boolean;
  creadaEn: string;
  /** Historial de canales externos; la demo registra explícitamente simulaciones. */
  entregas?: EntregaNotificacion[];
}

export type NuevaNotificacion = Omit<
  Notificacion,
  "id" | "leida" | "creadaEn" | "entregas"
>;
