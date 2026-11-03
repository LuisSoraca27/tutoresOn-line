import { pedir } from "@/lib/http";
import { tokenSesion } from "@/features/auth/sesion";
import type { NotificacionesRepo } from "./notificaciones.repo";
import type { Notificacion, NuevaNotificacion } from "./notificacion.types";
export class NotificacionesHttpRepo implements NotificacionesRepo {
  async crear(_nueva: NuevaNotificacion): Promise<Notificacion> { throw new Error("Las notificaciones se generan desde el servidor."); }
  async de(_destinatarioId: string) {
    const token = await tokenSesion();
    return pedir<Notificacion[]>("/notificaciones", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  }
  async sinLeer(_destinatarioId: string) {
    const token = await tokenSesion();
    return pedir<number>("/notificaciones/sin-leer", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  }
  async marcarLeidas(_destinatarioId: string) {
    const token = await tokenSesion();
    await pedir<void>("/notificaciones/leidas", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  }
}
