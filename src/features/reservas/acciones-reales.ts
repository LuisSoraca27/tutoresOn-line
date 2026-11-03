"use server";
import { revalidatePath } from "next/cache";
import { usuarioActual } from "@/features/auth/sesion";
import type { NuevaReserva } from "./reserva.types";
import { crearReservaReal } from "./reales";
import { tokenSesion } from "@/features/auth/sesion";
import { pedir } from "@/lib/http";
import type { DiaConTurnos } from "@/features/disponibilidad";

export async function crearReserva(datos: NuevaReserva) {
  const usuario = await usuarioActual();
  if (usuario?.rol !== "estudiante") return { ok: false as const, mensaje: "Inicia sesión como estudiante para reservar." };
  try {
    const reserva = await crearReservaReal(datos);
    revalidatePath("/estudiante/reservas");
    revalidatePath("/tutor/solicitudes");
    return { ok: true as const, reserva };
  } catch (error) {
    return { ok: false as const, mensaje: error instanceof Error ? error.message : "No pudimos crear la reserva." };
  }
}

async function autorizacion() {
  const usuario = await usuarioActual();
  const token = await tokenSesion();
  if (usuario?.rol !== "estudiante" || !token) throw new Error("Inicia sesión como estudiante.");
  return { Authorization: `Bearer ${token}` };
}
function refrescarReservas() {
  for (const ruta of ["/estudiante", "/estudiante/reservas", "/tutor/solicitudes", "/tutor/agenda", "/tutor/historial"]) revalidatePath(ruta);
}
export async function cancelarReserva(id: string) {
  try {
    await pedir(`/reservas/${encodeURIComponent(id)}/cancelar`, { method: "POST", headers: await autorizacion(), cache: "no-store" });
    refrescarReservas();
    return { ok: true as const };
  } catch (error) { return { ok: false as const, mensaje: error instanceof Error ? error.message : "No pudimos cancelar la reserva." }; }
}
export async function turnosParaReprogramar(id: string, desde: string, dias: number) {
  return pedir<DiaConTurnos[]>(`/reservas/${encodeURIComponent(id)}/turnos`, { headers: await autorizacion(), query: { desde, dias }, cache: "no-store" });
}
export async function reprogramarReserva(id: string, inicio: string, inicioAnterior: string) {
  try {
    await pedir(`/reservas/${encodeURIComponent(id)}/reprogramar`, { method: "PATCH", headers: await autorizacion(), body: { inicio, inicioAnterior }, cache: "no-store" });
    refrescarReservas();
    return { ok: true as const };
  } catch (error) { return { ok: false as const, mensaje: error instanceof Error ? error.message : "No pudimos cambiar el horario." }; }
}
