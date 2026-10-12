import { env } from "@/lib/env";
import { CatalogosHttpRepo } from "./catalogos.http";
import { CatalogosMockRepo } from "./catalogos.mock";
import type { CatalogosRepo } from "./catalogos.repo";

/**
 * Única instancia que consume la aplicación. Las pantallas dependen de la
 * interfaz `CatalogosRepo`, nunca de una implementación concreta.
 */
export const catalogosRepo: CatalogosRepo = env.usarDatosSimulados
  ? new CatalogosMockRepo()
  : new CatalogosHttpRepo();

export type { CatalogosRepo };
export type { Ciudad, Materia, Nivel, NivelId } from "./catalogo.types";
