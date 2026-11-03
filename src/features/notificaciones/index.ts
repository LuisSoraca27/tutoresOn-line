import { NotificacionesHttpRepo } from "./notificaciones.http";
import type { NotificacionesRepo } from "./notificaciones.repo";

export const notificacionesRepo: NotificacionesRepo = new NotificacionesHttpRepo();

export type { NotificacionesRepo } from "./notificaciones.repo";
export type { Notificacion, NuevaNotificacion, TipoNotificacion } from "./notificacion.types";
