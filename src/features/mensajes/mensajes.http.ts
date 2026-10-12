import { pedir } from "@/lib/http";
import type { ConversacionConMensajes, MensajesRepo } from "./mensajes.repo";
import type { Conversacion, Mensaje } from "./mensaje.types";

export class MensajesHttpRepo implements MensajesRepo {
  de(usuarioId: string) {
    return pedir<Conversacion[]>("/conversaciones", { query: { usuario_id: usuarioId } });
  }

  hilo(estudianteId: string, tutorId: string) {
    return pedir<ConversacionConMensajes>("/conversaciones/hilo", {
      query: { estudiante_id: estudianteId, tutor_id: tutorId },
    });
  }

  enviar(datos: { estudianteId: string; tutorId: string; autorId: string; texto: string }) {
    return pedir<Mensaje>("/mensajes", { method: "POST", body: datos });
  }

  async marcarLeidos(conversacionId: string, lectorId: string) {
    await pedir<void>(`/conversaciones/${conversacionId}/leidos`, {
      method: "POST",
      body: { lector_id: lectorId },
    });
  }
}
