export interface FavoritosRepo {
  /** Identificadores de los tutores guardados por un estudiante. */
  de(estudianteId: string): Promise<string[]>;
  /** Alterna: devuelve `true` si quedó guardado. */
  alternar(estudianteId: string, tutorId: string): Promise<boolean>;
}
