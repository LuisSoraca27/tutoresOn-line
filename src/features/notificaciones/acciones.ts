"use server";

import { revalidatePath } from "next/cache";
import { notificacionesRepo } from "./index";
import type { Notificacion } from "./notificacion.types";
import { usuarioActual } from "@/features/auth/sesion";

/** Avisos de una persona, para la campana y la página del centro de avisos. */
export async function consultarNotificaciones(
  destinatarioId: string,
): Promise<Notificacion[]> {
  const usuario = await usuarioActual();
  if (!usuario || usuario.id !== destinatarioId) return [];
  return notificacionesRepo.de(destinatarioId);
}

export async function marcarLeidas(destinatarioId: string): Promise<void> {
  const usuario = await usuarioActual();
  if (!usuario || usuario.id !== destinatarioId) return;
  await notificacionesRepo.marcarLeidas(destinatarioId);
  revalidatePath("/notificaciones");
}

export async function marcarMisNotificacionesLeidas(): Promise<void> {
  const usuario = await usuarioActual();
  if (usuario) await marcarLeidas(usuario.id);
}
