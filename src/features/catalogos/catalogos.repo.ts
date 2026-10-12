import type { Ciudad, Materia, Nivel } from "./catalogo.types";

/**
 * Contrato del dominio de catálogos. Es pequeño a propósito:
 * cada dominio expone solo lo que sus pantallas necesitan (principio I de SOLID).
 */
export interface CatalogosRepo {
  materias(): Promise<Materia[]>;
  niveles(): Promise<Nivel[]>;
  ciudades(): Promise<Ciudad[]>;
}
