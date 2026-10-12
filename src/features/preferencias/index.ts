import { env } from "@/lib/env";
import { PreferenciasHttpRepo } from "./preferencias.http";
import { PreferenciasMockRepo } from "./preferencias.mock";
import type { PreferenciasRepo } from "./preferencias.repo";

export const preferenciasRepo: PreferenciasRepo = env.usarDatosSimulados
  ? new PreferenciasMockRepo()
  : new PreferenciasHttpRepo();

export type { PreferenciasRepo } from "./preferencias.repo";
export type { Canal, EventoNotificable, Preferencias } from "./preferencias.types";
export { CANALES, EVENTOS, PREFERENCIAS_POR_DEFECTO } from "./preferencias.types";
