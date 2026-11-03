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
  avatarUrl?: string | null;
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

export const COOKIE_SESION = "tutores_sesion";
