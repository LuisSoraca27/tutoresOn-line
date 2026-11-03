"use server";
import { revalidatePath } from "next/cache";
import { tokenSesion, usuarioActual } from "@/features/auth/sesion";
import { pedir } from "@/lib/http";
import type { Mensaje } from "./mensaje.types";

async function credenciales(estudianteId: string, tutorId: string, usuarioId: string) {
  const usuario = await usuarioActual();
  if (!usuario || usuario.id !== usuarioId || (usuario.rol === "estudiante" ? usuario.id !== estudianteId : usuario.id !== tutorId)) throw new Error("Tu sesión no permite acceder a esta conversación.");
  const token = await tokenSesion();
  if (!token) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  return { Authorization: `Bearer ${token}` };
}
export async function consultarHilo(estudianteId: string, tutorId: string, lectorId: string) {
  const headers = await credenciales(estudianteId, tutorId, lectorId);
  const hilo = await pedir<{ mensajes: Mensaje[] }>("/mensajes/hilo", { headers, query: { estudianteId, tutorId }, cache: "no-store" });
  await pedir<void>("/mensajes/hilo/leer", { method: "POST", headers, body: { estudianteId, tutorId }, cache: "no-store" });
  return hilo;
}
export async function enviarMensaje(datos: { estudianteId: string; tutorId: string; autorId: string; texto: string }): Promise<{ ok: boolean; mensaje?: string }> {
  try {
    const headers = await credenciales(datos.estudianteId, datos.tutorId, datos.autorId);
    await pedir("/mensajes", { method: "POST", headers, body: { estudianteId: datos.estudianteId, tutorId: datos.tutorId, texto: datos.texto }, cache: "no-store" });
    revalidatePath("/estudiante/mensajes");
    revalidatePath("/tutor/mensajes");
    return { ok: true };
  } catch (error) { return { ok: false, mensaje: error instanceof Error ? error.message : "No pudimos enviar el mensaje." }; }
}
