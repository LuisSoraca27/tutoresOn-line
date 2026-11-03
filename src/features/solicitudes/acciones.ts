"use server";

import { revalidatePath } from "next/cache";
import { usuarioActual } from "@/features/auth/sesion";
import { responderSolicitud } from "./solicitudes";

export async function responder(id: string, estado: "aceptada" | "rechazada", inicioEsperado: string, motivo?: string) {
  const usuario = await usuarioActual();
  if (usuario?.rol !== "tutor") return { ok: false as const, mensaje: "Inicia sesión como tutor." };
  if (estado !== "aceptada" && estado !== "rechazada") return { ok: false as const, mensaje: "Respuesta inválida." };
  if (estado === "rechazada" && !motivo?.trim()) return { ok: false as const, mensaje: "Escribe un motivo para rechazar." };
  try {
    await responderSolicitud(id, estado === "aceptada" ? { estado, inicioEsperado } : { estado, inicioEsperado, motivo: motivo!.trim() });
    revalidatePath("/tutor/solicitudes");
    revalidatePath("/tutor/agenda");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, mensaje: error instanceof Error ? error.message : "No pudimos responder la solicitud." };
  }
}
