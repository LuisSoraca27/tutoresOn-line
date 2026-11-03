"use server";

import { revalidatePath } from "next/cache";
import { usuarioActual } from "@/features/auth/sesion";
import { cambiarFavorito } from "./reales";

/** Guardar o quitar un tutor de favoritos (F2.16). */
export async function alternarFavorito(
  estudianteId: string,
  tutorId: string,
  guardar: boolean,
): Promise<{ ok: true } | { ok: false; mensaje: string }> {
  const usuario = await usuarioActual();
  if (usuario?.rol !== "estudiante" || usuario.id !== estudianteId) return { ok: false, mensaje: "Inicia sesión como estudiante." };
  try {
    await cambiarFavorito(tutorId, guardar);
    revalidatePath("/estudiante/favoritos");
    revalidatePath("/buscar");
    return { ok: true };
  } catch (error) {
    return { ok: false, mensaje: error instanceof Error ? error.message : "No pudimos guardar el favorito." };
  }
}
