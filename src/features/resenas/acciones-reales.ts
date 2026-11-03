"use server";
import { revalidatePath } from "next/cache";
import { tokenSesion, usuarioActual } from "@/features/auth/sesion";
import { pedir } from "@/lib/http";

export async function responderResena(id: string, texto: string) {
  const usuario = await usuarioActual();
  if (usuario?.rol !== "tutor") return { ok: false as const, mensaje: "Inicia sesión como tutor." };
  try {
    const token = await tokenSesion();
    await pedir(`/resenas/${encodeURIComponent(id)}/respuesta`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: { texto }, cache: "no-store" });
    revalidatePath("/tutor/resenas");
    revalidatePath(`/tutores/${usuario.id}`);
    revalidatePath("/");
    return { ok: true as const };
  } catch (error) { return { ok: false as const, mensaje: error instanceof Error ? error.message : "No pudimos guardar tu respuesta." }; }
}

export async function publicarResena(datos: { reservaId: string; estudianteId: string; puntaje: number; comentario: string; criterios?: { puntualidad: number; claridad: number; dominio: number } }) {
  const usuario = await usuarioActual();
  if (usuario?.rol !== "estudiante" || usuario.id !== datos.estudianteId) return { ok: false as const, mensaje: "Inicia sesión como estudiante." };
  try {
    const token = await tokenSesion();
    const resultado = await pedir<{ tutorId: string }>("/resenas", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: { reservaId: datos.reservaId, puntaje: datos.puntaje, comentario: datos.comentario, criterios: datos.criterios }, cache: "no-store" });
    revalidatePath(`/tutores/${resultado.tutorId}`);
    revalidatePath("/estudiante/reservas");
    revalidatePath("/tutor/resenas");
    revalidatePath("/buscar");
    revalidatePath("/");
    return { ok: true as const };
  } catch (error) { return { ok: false as const, mensaje: error instanceof Error ? error.message : "No pudimos publicar la reseña." }; }
}
