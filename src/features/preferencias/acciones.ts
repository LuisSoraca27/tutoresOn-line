"use server";

import { revalidatePath } from "next/cache";
import { preferenciasRepo } from "./index";
import { CANALES, EVENTOS, type Preferencias } from "./preferencias.types";
import { usuarioActual } from "@/features/auth/sesion";

export async function guardarPreferencias(
  usuarioId: string,
  canales: Preferencias["canales"],
): Promise<{ ok: boolean; mensaje: string }> {
  const usuario = await usuarioActual();
  if (!usuario || usuario.id !== usuarioId)
    return {
      ok: false,
      mensaje: "Tu sesión no permite guardar estas preferencias.",
    };
  if (
    !canales ||
    EVENTOS.some(
      (evento) =>
        !Array.isArray(canales[evento.id]) ||
        canales[evento.id].some(
          (canal) => !CANALES.some((item) => item.id === canal),
        ),
    )
  )
    return {
      ok: false,
      mensaje: "Revisa los canales de notificación elegidos.",
    };
  try {
    await preferenciasRepo.guardar(usuarioId, canales);

    revalidatePath("/estudiante/perfil");
    revalidatePath("/tutor/perfil");

    return { ok: true, mensaje: "Preferencias guardadas." };
  } catch {
    return {
      ok: false,
      mensaje: "No pudimos guardar las preferencias. Inténtalo de nuevo.",
    };
  }
}
