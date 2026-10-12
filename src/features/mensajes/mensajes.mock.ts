import { almacen, siguienteId } from "@/mocks/almacen";
import { demora } from "@/mocks/demora";
import type { ConversacionConMensajes, MensajesRepo } from "./mensajes.repo";
import type { Conversacion, Mensaje } from "./mensaje.types";
import { idConversacion } from "./mensaje.types";

export class MensajesMockRepo implements MensajesRepo {
  async de(usuarioId: string): Promise<Conversacion[]> {
    await demora(180);

    return almacen.conversaciones
      .filter(
        (conversacion) =>
          conversacion.estudianteId === usuarioId || conversacion.tutorId === usuarioId,
      )
      .sort((a, b) => b.ultimoEn.localeCompare(a.ultimoEn));
  }

  async hilo(estudianteId: string, tutorId: string): Promise<ConversacionConMensajes> {
    await demora(200);

    const id = idConversacion(estudianteId, tutorId);

    const conversacion: Conversacion = almacen.conversaciones.find(
      (candidata) => candidata.id === id,
    ) ?? { id, estudianteId, tutorId, ultimoEn: new Date().toISOString() };

    return {
      conversacion,
      mensajes: almacen.mensajes
        .filter((mensaje) => mensaje.conversacionId === id)
        .sort((a, b) => a.enviadoEn.localeCompare(b.enviadoEn)),
    };
  }

  async enviar(datos: {
    estudianteId: string;
    tutorId: string;
    autorId: string;
    texto: string;
  }): Promise<Mensaje> {
    await demora(300);

    const id = idConversacion(datos.estudianteId, datos.tutorId);
    const ahora = new Date().toISOString();

    // La conversación se crea con el primer mensaje: no hay un paso aparte
    // de "abrir conversación" que dejaría hilos vacíos por todos lados.
    const existente = almacen.conversaciones.find((candidata) => candidata.id === id);

    if (existente) {
      existente.ultimoEn = ahora;
    } else {
      almacen.conversaciones.push({
        id,
        estudianteId: datos.estudianteId,
        tutorId: datos.tutorId,
        ultimoEn: ahora,
      });
    }

    const mensaje: Mensaje = {
      id: siguienteId("M"),
      conversacionId: id,
      autorId: datos.autorId,
      texto: datos.texto,
      enviadoEn: ahora,
      leido: false,
    };

    almacen.mensajes.push(mensaje);
    return mensaje;
  }

  async marcarLeidos(conversacionId: string, lectorId: string): Promise<void> {
    for (const mensaje of almacen.mensajes) {
      if (mensaje.conversacionId === conversacionId && mensaje.autorId !== lectorId) {
        mensaje.leido = true;
      }
    }
  }
}
