import "server-only";
import { tokenSesion } from "@/features/auth/sesion";
import { pedir } from "@/lib/http";
import type { Contacto } from "@/components/mensajes/bandeja-mensajes";

export async function contactosReales() {
  const token = await tokenSesion();
  if (!token) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  return pedir<Contacto[]>("/mensajes/contactos", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
}
