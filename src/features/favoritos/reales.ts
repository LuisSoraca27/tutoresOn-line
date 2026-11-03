import "server-only";
import { tokenSesion } from "@/features/auth/sesion";
import { pedir } from "@/lib/http";

async function autorizacion() {
  const token = await tokenSesion();
  if (!token) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  return { Authorization: `Bearer ${token}` };
}
export async function listarFavoritos() {
  return pedir<string[]>("/favoritos", { headers: await autorizacion(), cache: "no-store" });
}
export async function cambiarFavorito(tutorId: string, guardar: boolean) {
  return pedir<void>(`/favoritos/${encodeURIComponent(tutorId)}`, { method: guardar ? "PUT" : "DELETE", headers: await autorizacion(), cache: "no-store" });
}
