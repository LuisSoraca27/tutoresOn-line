import { pedir } from "@/lib/http";
import type { NotificacionesRepo } from "./notificaciones.repo";
import type { Notificacion, NuevaNotificacion } from "./notificacion.types";

export class NotificacionesHttpRepo implements NotificacionesRepo {
  crear(nueva: NuevaNotificacion) {
    return pedir<Notificacion>("/notificaciones", { method: "POST", body: nueva });
  }

  de(destinatarioId: string) {
    return pedir<Notificacion[]>("/notificaciones", { query: { destinatario_id: destinatarioId } });
  }

  sinLeer(destinatarioId: string) {
    return pedir<number>("/notificaciones/sin-leer", { query: { destinatario_id: destinatarioId } });
  }

  async marcarLeidas(destinatarioId: string) {
    await pedir<void>("/notificaciones/leidas", {
      method: "POST",
      body: { destinatario_id: destinatarioId },
    });
  }
}
