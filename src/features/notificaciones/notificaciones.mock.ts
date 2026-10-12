import { almacen, siguienteId } from "@/mocks/almacen";
import { demora } from "@/mocks/demora";
import type { NotificacionesRepo } from "./notificaciones.repo";
import type { Notificacion, NuevaNotificacion } from "./notificacion.types";
import {
  PREFERENCIAS_POR_DEFECTO,
  type EventoNotificable,
} from "@/features/preferencias/preferencias.types";

export class NotificacionesMockRepo implements NotificacionesRepo {
  async crear(nueva: NuevaNotificacion): Promise<Notificacion> {
    const eventos: Partial<
      Record<NuevaNotificacion["tipo"], EventoNotificable>
    > = {
      "reserva-aceptada": "reserva-confirmada",
      "reserva-rechazada": "cambio-de-estado",
      "reserva-cancelada": "cambio-de-estado",
      "reserva-reprogramada": "cambio-de-estado",
      "sesion-finalizada": "resumen-sesion",
    };
    const evento = eventos[nueva.tipo];
    const preferencias =
      almacen.preferencias.find(
        (item) => item.usuarioId === nueva.destinatarioId,
      )?.canales ?? PREFERENCIAS_POR_DEFECTO;
    const notificacion: Notificacion = {
      ...nueva,
      id: siguienteId("N"),
      leida: false,
      creadaEn: new Date().toISOString(),
      entregas: evento
        ? preferencias[evento].map((canal) => ({
            canal,
            estado: "simulado",
            detalle:
              "Registrado en modo demostración; no se envió al canal externo.",
          }))
        : [],
    };

    almacen.notificaciones.unshift(notificacion);
    return notificacion;
  }

  async de(destinatarioId: string): Promise<Notificacion[]> {
    await demora(150);
    return almacen.notificaciones.filter(
      (aviso) => aviso.destinatarioId === destinatarioId,
    );
  }

  async sinLeer(destinatarioId: string): Promise<number> {
    return almacen.notificaciones.filter(
      (aviso) => aviso.destinatarioId === destinatarioId && !aviso.leida,
    ).length;
  }

  async marcarLeidas(destinatarioId: string): Promise<void> {
    await demora(120);
    for (const aviso of almacen.notificaciones) {
      if (aviso.destinatarioId === destinatarioId) aviso.leida = true;
    }
  }
}
