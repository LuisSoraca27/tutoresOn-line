import { pedir } from "@/lib/http";
import type { PreferenciasRepo } from "./preferencias.repo";
import type { Preferencias } from "./preferencias.types";
import { tokenSesion } from "@/features/auth/sesion";

export class PreferenciasHttpRepo implements PreferenciasRepo {
  async de(usuarioId: string) {
    const token = await tokenSesion();
    return pedir<Preferencias>(`/usuarios/${usuarioId}/preferencias`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  }

  async guardar(usuarioId: string, canales: Preferencias["canales"]) {
    const token = await tokenSesion();
    return pedir<Preferencias>(`/usuarios/${usuarioId}/preferencias`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: { canales },
    });
  }
}
