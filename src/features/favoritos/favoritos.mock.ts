import { almacen } from "@/mocks/almacen";
import { demora } from "@/mocks/demora";
import type { FavoritosRepo } from "./favoritos.repo";

/** Clave del par estudiante–tutor, para guardarlos en un solo conjunto. */
const clave = (estudianteId: string, tutorId: string) => `${estudianteId}:${tutorId}`;

export class FavoritosMockRepo implements FavoritosRepo {
  async de(estudianteId: string): Promise<string[]> {
    await demora(120);
    return almacen.favoritos
      .filter((par) => par.startsWith(`${estudianteId}:`))
      .map((par) => par.split(":")[1]);
  }

  async alternar(estudianteId: string, tutorId: string): Promise<boolean> {
    await demora(200);

    const par = clave(estudianteId, tutorId);
    const indice = almacen.favoritos.indexOf(par);

    if (indice >= 0) {
      almacen.favoritos.splice(indice, 1);
      return false;
    }

    almacen.favoritos.push(par);
    return true;
  }
}
