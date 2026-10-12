import type { NivelId } from "@/features/catalogos/catalogo.types";

export type Modalidad = "virtual" | "presencial" | "ambas";

export type OrdenTutor = "relevancia" | "precio-asc" | "precio-desc" | "calificacion" | "sesiones";

/** Reputación estilo marketplace: no basta el promedio, hace falta la distribución. */
export interface Reputacion {
  promedio: number;
  total: number;
  /** Cuántas reseñas hay de 5, 4, 3, 2 y 1 estrella. */
  distribucion: Record<"5" | "4" | "3" | "2" | "1", number>;
}

/** Una materia que dicta el tutor, con los niveles y el precio de esa combinación. */
export interface MateriaDictada {
  materiaId: string;
  nivelIds: NivelId[];
  precioHora: number;
}

export interface Tutor {
  id: string;
  nombre: string;
  titulo: string;
  bio: string;
  avatarUrl: string | null;
  modalidad: Modalidad;
  ciudadId: string | null;
  radioKm: number | null;
  materias: MateriaDictada[];
  /** Precio más bajo entre sus materias; se usa en la tarjeta de resultados. */
  precioDesde: number;
  reputacion: Reputacion;
  sesionesCompletadas: number;
  verificado: boolean;
  respondeRapido: boolean;
  /** Alimenta el modo "tutor al instante" (M4). */
  disponibleAhora: boolean;
  idiomas: string[];
}

/** Criterios de búsqueda de la regla de negocio 2. */
export interface FiltrosTutor {
  q?: string;
  materiaId?: string;
  nivelId?: NivelId;
  modalidad?: Modalidad;
  ciudadId?: string;
  precioMax?: number;
  calificacionMin?: number;
  soloVerificados?: boolean;
  orden?: OrdenTutor;
  pagina?: number;
  porPagina?: number;
}

export interface Pagina<T> {
  items: T[];
  total: number;
  pagina: number;
  porPagina: number;
}
