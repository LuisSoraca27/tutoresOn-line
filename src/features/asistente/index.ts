import { env } from "@/lib/env";
import { AsistenteHttpRepo } from "./asistente.http";
import { AsistenteMockRepo } from "./asistente.mock";
import type { AsistenteRepo } from "./asistente.repo";

export const asistenteRepo: AsistenteRepo = env.usarDatosSimulados
  ? new AsistenteMockRepo()
  : new AsistenteHttpRepo();

export type { AsistenteRepo } from "./asistente.repo";
export type { Mensaje, RespuestaAsistente } from "./asistente.types";
