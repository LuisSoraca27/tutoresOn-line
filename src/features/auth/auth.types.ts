import type { NivelId } from "@/features/catalogos/catalogo.types";
import type { Rol } from "@/config/sitio";

/**
 * Cuenta de una persona en la plataforma (M1, regla de negocio 1).
 *
 * El identificador es el mismo del dominio: un tutor es `t-007` tanto aquí
 * como en su perfil público. Así la sesión y el resto del sistema hablan del
 * mismo sujeto sin tablas de traducción.
 */
export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Exclude<Rol, "visitante">;
  telefono?: string;
  ciudadId?: string;
  /** Solo estudiantes: en qué nivel está estudiando. */
  nivelId?: NivelId;
  creadoEn: string;
}

export interface Credenciales {
  correo: string;
  clave: string;
}

export interface RegistroEstudiante {
  nombre: string;
  correo: string;
  clave: string;
  telefono?: string;
  ciudadId?: string;
  nivelId: NivelId;
}

/** Lo que recoge el asistente por pasos del tutor (F1.3). */
export interface RegistroTutor {
  nombre: string;
  correo: string;
  clave: string;
  telefono?: string;
  titulo: string;
  bio: string;
  modalidad: "virtual" | "presencial" | "ambas";
  ciudadId?: string;
  radioKm?: number;
  materias: { materiaId: string; nivelIds: NivelId[]; precioHora: number }[];
  idiomas: string[];
}

/**
 * Lo que viaja en la cookie de sesión.
 *
 * Hoy es `id|rol` firmado por nadie, porque no hay servidor de verdad que
 * firmar. Con FastAPI será un JWT y estos mismos dos datos serán sus claims:
 * el middleware seguirá leyendo lo mismo, solo que verificando la firma.
 */
export interface Sesion {
  id: string;
  rol: Exclude<Rol, "visitante">;
}

export const COOKIE_SESION = "tutores_sesion";

export function serializarSesion(sesion: Sesion): string {
  return `${sesion.id}|${sesion.rol}`;
}

export function deserializarSesion(valor: string | undefined): Sesion | null {
  if (!valor) return null;

  const [id, rol] = valor.split("|");
  if (!id || !rol) return null;
  if (rol !== "estudiante" && rol !== "tutor") return null;

  return { id, rol };
}
