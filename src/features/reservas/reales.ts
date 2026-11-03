import "server-only";
import { tokenSesion } from "@/features/auth/sesion";
import { pedir } from "@/lib/http";
import type { NuevaReserva, EstadoReserva } from "./reserva.types";

export interface ReservaReal { id: string; inicio: string; fin: string; precio: number; lugar?: string }
export interface ReservaEstudiante { id: string; tutorId: string; tutorNombre: string; materiaNombre: string; nivelNombre: string; inicio: string; fin: string; duracionMinutos: number; modalidad: string; precio: number; estado: EstadoReserva; motivoRechazo: string | null; puedeModificar: boolean; puedeResenar: boolean }

async function headers() {
  const token = await tokenSesion();
  if (!token) throw new Error("Tu sesión expiró. Inicia sesión de nuevo.");
  return { Authorization: `Bearer ${token}` };
}
export async function crearReservaReal(datos: NuevaReserva) {
  return pedir<ReservaReal>("/reservas", { method: "POST", headers: await headers(), body: { tutorId: datos.tutorId, materiaId: datos.materiaId, nivelId: datos.nivelId, modalidad: datos.modalidad, inicio: datos.inicio, duracionMinutos: datos.duracionMinutos, lugar: datos.lugar, notaEstudiante: datos.notaEstudiante }, cache: "no-store" });
}
export async function misReservas() {
  return pedir<ReservaEstudiante[]>("/reservas/mias", { headers: await headers(), cache: "no-store" });
}
