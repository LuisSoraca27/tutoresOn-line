import type { Notificacion, NuevaNotificacion } from "./notificacion.types";

export interface NotificacionesRepo {
  crear(nueva: NuevaNotificacion): Promise<Notificacion>;
  de(destinatarioId: string): Promise<Notificacion[]>;
  sinLeer(destinatarioId: string): Promise<number>;
  marcarLeidas(destinatarioId: string): Promise<void>;
}
