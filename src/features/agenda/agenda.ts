import "server-only";
import { tokenSesion } from "@/features/auth/sesion";
import { pedir } from "@/lib/http";

export interface SesionAgenda {
  id: string;
  inicio: string;
  fin: string;
  duracionMinutos: number;
  precio: number;
  estudianteNombre: string;
  materiaNombre: string;
  nivelNombre: string;
  modalidad: "virtual" | "presencial";
  lugar: string | null;
  estado: "pendiente" | "aceptada" | "en-curso";
}

export async function consultarAgenda(desde: string, hasta: string) {
  const token = await tokenSesion();
  if (!token) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  return pedir<SesionAgenda[]>("/agenda", { headers: { Authorization: `Bearer ${token}` }, query: { desde, hasta }, cache: "no-store" });
}
