import { pedir } from "@/lib/http";
import type { AsistenteRepo } from "./asistente.repo";
import type { Mensaje, RespuestaAsistente } from "./asistente.types";

/**
 * Implementación real: FastAPI recibe la consulta, llama al modelo y
 * devuelve exactamente la misma forma que produce el intérprete por reglas.
 * Por eso cambiar de una a otra no toca ni una línea de la interfaz.
 */
export class AsistenteHttpRepo implements AsistenteRepo {
  emparejar(consulta: string, historial: Mensaje[]) {
    return pedir<RespuestaAsistente>("/asistente/emparejar", {
      method: "POST",
      body: { consulta, historial },
    });
  }
}
