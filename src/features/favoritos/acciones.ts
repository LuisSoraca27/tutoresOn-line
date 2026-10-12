"use server";

import { revalidatePath } from "next/cache";
import { favoritosRepo } from "./index";

/** Guardar o quitar un tutor de favoritos (F2.16). */
export async function alternarFavorito(
  estudianteId: string,
  tutorId: string,
): Promise<boolean> {
  const guardado = await favoritosRepo.alternar(estudianteId, tutorId);

  revalidatePath("/estudiante/favoritos");
  revalidatePath("/buscar");

  return guardado;
}
