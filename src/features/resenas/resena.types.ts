import type { Reputacion } from "@/features/tutores/tutor.types";

/**
 * Reseña de una sesión (M8).
 *
 * Siempre cuelga de una reserva finalizada: no se puede calificar a un tutor
 * con el que nunca se tuvo clase. Esa es la diferencia entre una reputación
 * que significa algo y un buzón de opiniones.
 */
export interface Resena {
  id: string;
  reservaId: string;
  tutorId: string;
  estudianteId: string;
  /** 1 a 5 estrellas. */
  puntaje: number;
  comentario: string;
  /** Desglose opcional (F8.2), también de 1 a 5. */
  criterios?: {
    puntualidad: number;
    claridad: number;
    dominio: number;
  };
  /** Respuesta pública del tutor (F8.6). */
  respuestaTutor?: string;
  /** Denuncia de un lector; la revisa el equipo. */
  reporte?: {
    motivo: string;
    reportadaEn: string;
  };
  creadaEn: string;
}

export type NuevaResena = Omit<Resena, "id" | "creadaEn" | "respuestaTutor">;

export const CRITERIOS: { id: keyof NonNullable<Resena["criterios"]>; etiqueta: string }[] = [
  { id: "puntualidad", etiqueta: "Puntualidad" },
  { id: "claridad", etiqueta: "Claridad al explicar" },
  { id: "dominio", etiqueta: "Dominio del tema" },
];

/**
 * Funde las reseñas nuevas con el agregado histórico del tutor.
 *
 * Los datos simulados traen un promedio y una distribución ya calculados,
 * como los tendría cualquier plataforma en producción: nadie recorre veinte
 * mil reseñas para pintar un perfil, se guarda el agregado. Esta función
 * hace lo mismo que hará el backend al insertar una reseña.
 */
export function combinarReputacion(base: Reputacion, nuevas: Resena[]): Reputacion {
  if (nuevas.length === 0) return base;

  const distribucion = { ...base.distribucion };
  let suma = base.promedio * base.total;

  for (const resena of nuevas) {
    const escalon = String(Math.round(resena.puntaje)) as keyof Reputacion["distribucion"];
    distribucion[escalon] = (distribucion[escalon] ?? 0) + 1;
    suma += resena.puntaje;
  }

  const total = base.total + nuevas.length;

  return {
    total,
    promedio: Math.round((suma / total) * 10) / 10,
    distribucion,
  };
}
