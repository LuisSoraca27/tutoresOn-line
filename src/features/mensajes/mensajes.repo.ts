import type { Conversacion, Mensaje } from "./mensaje.types";

export interface ConversacionConMensajes {
  conversacion: Conversacion;
  mensajes: Mensaje[];
}

export interface MensajesRepo {
  /** Conversaciones de una persona, la más reciente primero. */
  de(usuarioId: string): Promise<Conversacion[]>;
  hilo(estudianteId: string, tutorId: string): Promise<ConversacionConMensajes>;
  enviar(datos: {
    estudianteId: string;
    tutorId: string;
    autorId: string;
    texto: string;
  }): Promise<Mensaje>;
  marcarLeidos(conversacionId: string, lectorId: string): Promise<void>;
}
