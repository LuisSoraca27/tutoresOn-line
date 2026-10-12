import type { Preferencias } from "./preferencias.types";

export interface PreferenciasRepo {
  de(usuarioId: string): Promise<Preferencias>;
  guardar(usuarioId: string, canales: Preferencias["canales"]): Promise<Preferencias>;
}
