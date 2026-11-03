import "server-only";
import { tokenSesion } from "@/features/auth/sesion";
import { pedir } from "@/lib/http";

export interface SesionLiquidable {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  tutorNombre: string;
  estudianteNombre: string;
  materiaNombre: string;
  duracionMinutos: number;
  precio: number;
}

export async function consultarSesiones(desde?: string, hasta?: string) {
  const token = await tokenSesion();
  if (!token) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  return pedir<SesionLiquidable[]>("/ingresos", { headers: { Authorization: `Bearer ${token}` }, query: { desde, hasta }, cache: "no-store" });
}
