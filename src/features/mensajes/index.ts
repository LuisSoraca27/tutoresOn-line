import { env } from "@/lib/env";
import { MensajesHttpRepo } from "./mensajes.http";
import { MensajesMockRepo } from "./mensajes.mock";
import type { MensajesRepo } from "./mensajes.repo";

export const mensajesRepo: MensajesRepo = env.usarDatosSimulados
  ? new MensajesMockRepo()
  : new MensajesHttpRepo();

export type { ConversacionConMensajes, MensajesRepo } from "./mensajes.repo";
export type { Conversacion, Mensaje } from "./mensaje.types";
export { idConversacion } from "./mensaje.types";
