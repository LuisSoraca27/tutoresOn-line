import { CIUDADES, NIVELES } from "@/mocks/datos";
import { almacen } from "@/mocks/almacen";
import { demora } from "@/mocks/demora";
import type { CatalogosRepo } from "./catalogos.repo";

export class CatalogosMockRepo implements CatalogosRepo {
  async materias() {
    await demora();
    return almacen.materias;
  }

  async niveles() {
    await demora();
    return NIVELES;
  }

  async ciudades() {
    await demora();
    return CIUDADES;
  }
}
