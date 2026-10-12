import { almacen } from "@/mocks/almacen";
import { demora } from "@/mocks/demora";
import type { PreferenciasRepo } from "./preferencias.repo";
import type { Preferencias } from "./preferencias.types";
import { PREFERENCIAS_POR_DEFECTO } from "./preferencias.types";

export class PreferenciasMockRepo implements PreferenciasRepo {
  async de(usuarioId: string): Promise<Preferencias> {
    await demora(150);

    return (
      almacen.preferencias.find((preferencias) => preferencias.usuarioId === usuarioId) ?? {
        usuarioId,
        canales: structuredClone(PREFERENCIAS_POR_DEFECTO),
      }
    );
  }

  async guardar(usuarioId: string, canales: Preferencias["canales"]): Promise<Preferencias> {
    await demora(300);

    const existente = almacen.preferencias.find(
      (preferencias) => preferencias.usuarioId === usuarioId,
    );

    if (existente) {
      existente.canales = canales;
      return existente;
    }

    const nuevas: Preferencias = { usuarioId, canales };
    almacen.preferencias.push(nuevas);
    return nuevas;
  }
}
