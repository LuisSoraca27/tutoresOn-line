import { almacen } from "@/mocks/almacen";
import type { ApuntesRepo } from "./apuntes.repo";
export class ApuntesMockRepo implements ApuntesRepo {
  async obtener(reservaId: string, usuarioId: string) {
    return (
      almacen.notasSesion.find(
        (nota) => nota.reservaId === reservaId && nota.usuarioId === usuarioId,
      )?.texto ?? ""
    );
  }
  async guardar(reservaId: string, usuarioId: string, texto: string) {
    const actual = almacen.notasSesion.find(
      (nota) => nota.reservaId === reservaId && nota.usuarioId === usuarioId,
    );
    if (actual) actual.texto = texto;
    else almacen.notasSesion.push({ reservaId, usuarioId, texto });
  }
}
