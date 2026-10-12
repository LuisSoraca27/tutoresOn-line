import { pedir } from "@/lib/http";
import type { PreferenciasRepo } from "./preferencias.repo";
import type { Preferencias } from "./preferencias.types";

export class PreferenciasHttpRepo implements PreferenciasRepo {
  de(usuarioId: string) {
    return pedir<Preferencias>(`/usuarios/${usuarioId}/preferencias`);
  }

  guardar(usuarioId: string, canales: Preferencias["canales"]) {
    return pedir<Preferencias>(`/usuarios/${usuarioId}/preferencias`, {
      method: "PUT",
      body: { canales },
    });
  }
}
