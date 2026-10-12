import { pedir } from "@/lib/http";
import type { Ciudad, Materia, Nivel } from "./catalogo.types";
import type { CatalogosRepo } from "./catalogos.repo";

/** Implementación contra FastAPI. Se activa apagando NEXT_PUBLIC_DATOS_SIMULADOS. */
export class CatalogosHttpRepo implements CatalogosRepo {
  materias() {
    return pedir<Materia[]>("/catalogos/materias");
  }

  niveles() {
    return pedir<Nivel[]>("/catalogos/niveles");
  }

  ciudades() {
    return pedir<Ciudad[]>("/catalogos/ciudades");
  }
}
