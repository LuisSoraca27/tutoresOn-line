import { PreferenciasHttpRepo } from "./preferencias.http";
import type { PreferenciasRepo } from "./preferencias.repo";

export const preferenciasRepo: PreferenciasRepo = new PreferenciasHttpRepo();

export type { PreferenciasRepo } from "./preferencias.repo";
export type { Canal, EventoNotificable, Preferencias } from "./preferencias.types";
export { CANALES, EVENTOS, PREFERENCIAS_POR_DEFECTO } from "./preferencias.types";
