import { env } from "@/lib/env";
import { NotificacionesHttpRepo } from "./notificaciones.http";
import { NotificacionesMockRepo } from "./notificaciones.mock";
import type { NotificacionesRepo } from "./notificaciones.repo";

export const notificacionesRepo: NotificacionesRepo = env.usarDatosSimulados
  ? new NotificacionesMockRepo()
  : new NotificacionesHttpRepo();

export type { NotificacionesRepo } from "./notificaciones.repo";
export type { Notificacion, NuevaNotificacion, TipoNotificacion } from "./notificacion.types";
