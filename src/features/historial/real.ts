import "server-only";
import { tokenSesion } from "@/features/auth/sesion";
import { pedir } from "@/lib/http";
import type { EstadoReserva } from "@/features/reservas/reserva.types";

export interface SesionHistorial {
  id: string;
  inicio: string;
  fin: string;
  duracionMinutos: number;
  precio: number;
  estado: EstadoReserva;
  estudianteNombre: string;
  materiaNombre: string;
  nivelNombre: string;
  cierre: { asistio: boolean; duracionReal: number } | null;
}
export async function consultarHistorial() {
  const token = await tokenSesion();
  if (!token) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  return pedir<SesionHistorial[]>("/historial", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
}
