"use server";
import { revalidatePath } from "next/cache";
import { usuarioActual, tokenSesion } from "@/features/auth/sesion";
import { pedir } from "@/lib/http";
import { env } from "@/lib/env";
import type { NuevaSolicitud, SolicitudExpress } from "./express.types";
import type { Tutor } from "@/features/tutores";

export type ResultadoExpress = { ok: true; solicitud: SolicitudExpress } | { ok: false; mensaje: string };
export interface EstadoBusqueda { solicitud: SolicitudExpress | null; candidatos: { id: string; nombre: string }[]; tutor: Tutor | null }
async function headers(rol?: "estudiante" | "tutor") {
  const usuario = await usuarioActual();
  const token = await tokenSesion();
  if (!usuario || !token || (rol && usuario.rol !== rol)) throw new Error("Tu sesión expiró o no permite esta acción.");
  return { Authorization: `Bearer ${token}` };
}
export async function obtenerSocketExpress() {
  const data = await pedir<{ ticket: string }>("/express/ticket", { method: "POST", headers: await headers(), cache: "no-store" });
  const url = new URL("express/socket", env.apiUrl.endsWith("/") ? env.apiUrl : `${env.apiUrl}/`);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("ticket", data.ticket);
  return url.toString();
}
export async function solicitudActiva() {
  return pedir<SolicitudExpress | null>("/express/activa", { headers: await headers("estudiante"), cache: "no-store" });
}
export async function lanzarBusqueda(nueva: NuevaSolicitud): Promise<ResultadoExpress> {
  try {
    const usuario = await usuarioActual();
    if (usuario?.id !== nueva.estudianteId) throw new Error("Inicia sesión como estudiante.");
    const solicitud = await pedir<SolicitudExpress>("/express", { method: "POST", headers: await headers("estudiante"), body: { materiaId: nueva.materiaId, nivelId: nueva.nivelId, modalidad: nueva.modalidad, duracionMinutos: nueva.duracionMinutos, nota: nueva.nota }, cache: "no-store" });
    return { ok: true, solicitud };
  } catch (error) { return { ok: false, mensaje: error instanceof Error ? error.message : "No pudimos lanzar la búsqueda." }; }
}
export async function consultarBusqueda(id: string): Promise<EstadoBusqueda> {
  return pedir<EstadoBusqueda>(`/express/${encodeURIComponent(id)}`, { headers: await headers("estudiante"), cache: "no-store" });
}
export async function cancelarBusqueda(id: string) {
  try { await pedir(`/express/${encodeURIComponent(id)}/cancelar`, { method: "POST", headers: await headers("estudiante"), cache: "no-store" }); return { ok: true as const }; }
  catch (error) { return { ok: false as const, mensaje: error instanceof Error ? error.message : "No pudimos cancelar la búsqueda." }; }
}
export async function tomarSolicitud(solicitudId: string, tutorId: string): Promise<ResultadoExpress> {
  try {
    const usuario = await usuarioActual();
    if (usuario?.id !== tutorId) throw new Error("Inicia sesión como tutor.");
    const solicitud = await pedir<SolicitudExpress>(`/express/${encodeURIComponent(solicitudId)}/tomar`, { method: "POST", headers: await headers("tutor"), cache: "no-store" });
    revalidatePath("/tutor/agenda"); revalidatePath("/estudiante/reservas");
    return { ok: true, solicitud };
  } catch (error) { return { ok: false, mensaje: error instanceof Error ? error.message : "No pudimos tomar la solicitud." }; }
}
export async function solicitudesParaTutor(tutorId: string) {
  const usuario = await usuarioActual();
  if (usuario?.id !== tutorId) throw new Error("Inicia sesión como tutor.");
  return pedir<(SolicitudExpress & { estudianteNombre: string })[]>("/express", { headers: await headers("tutor"), cache: "no-store" });
}
