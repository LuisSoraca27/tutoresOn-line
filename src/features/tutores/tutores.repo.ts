import type { FiltrosTutor, Pagina, Tutor } from "./tutor.types";

/**
 * Lo que el tutor puede cambiar de su propio perfil.
 *
 * Deliberadamente no incluye reputación, sesiones completadas ni verificado:
 * eso no lo edita quien es dueño del perfil, lo produce la plataforma. Si
 * estuvieran aquí, cualquiera podría ponerse cinco estrellas.
 */
export type CambiosPerfil = Partial<
  Pick<
    Tutor,
    "titulo" | "bio" | "modalidad" | "ciudadId" | "radioKm" | "materias" | "idiomas" | "disponibleAhora" | "avatarUrl"
  >
>;

export interface TutoresRepo {
  buscar(filtros: FiltrosTutor): Promise<Pagina<Tutor>>;
  obtener(id: string): Promise<Tutor | null>;
  destacados(limite?: number): Promise<Tutor[]>;
  /** Edición del perfil propio (F5.7, F5.8, F5.12). */
  actualizar(id: string, cambios: CambiosPerfil): Promise<Tutor>;
}
