/** Niveles educativos que maneja la plataforma (regla de negocio 2). */
export type NivelId =
  | "primaria"
  | "bachillerato"
  | "tecnico"
  | "universitario"
  | "posgrado";

export interface Nivel {
  id: NivelId;
  nombre: string;
}

export interface Materia {
  id: string;
  nombre: string;
  /** Agrupador para la búsqueda: "Matemáticas", "Ciencias", "Idiomas"… */
  area: string;
}

export interface Ciudad {
  id: string;
  nombre: string;
  departamento: string;
}
