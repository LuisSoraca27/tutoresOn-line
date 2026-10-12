import { pedir } from "@/lib/http";
import type { ApuntesRepo } from "./apuntes.repo";
export class ApuntesHttpRepo implements ApuntesRepo {
  obtener(reservaId: string, usuarioId: string) {
    return pedir<string>(`/sesiones/${reservaId}/notas`, {
      query: { usuario_id: usuarioId },
    });
  }
  async guardar(reservaId: string, usuarioId: string, texto: string) {
    await pedir<void>(`/sesiones/${reservaId}/notas`, {
      method: "PUT",
      body: { usuarioId, texto },
    });
  }
}
