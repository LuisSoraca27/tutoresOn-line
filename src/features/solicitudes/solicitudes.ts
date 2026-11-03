import "server-only";
import { tokenSesion } from "@/features/auth/sesion";
import { pedir } from "@/lib/http";

export interface Solicitud {
  id: string;
  estudianteNombre: string;
  materiaNombre: string;
  nivelNombre: string;
  inicio: string;
  fin: string;
  duracionMinutos: number;
  precio: number;
  modalidad: "virtual" | "presencial";
  estado: "pendiente" | "aceptada" | "rechazada";
  lugar: string | null;
  notaEstudiante: string | null;
  motivoRechazo: string | null;
}

async function autorizacion() {
  const token = await tokenSesion();
  if (!token) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  return { Authorization: `Bearer ${token}` };
}

export async function listarSolicitudes() {
  return pedir<Solicitud[]>("/solicitudes", { headers: await autorizacion(), cache: "no-store" });
}

export async function responderSolicitud(id: string, respuesta: { estado: "aceptada"; inicioEsperado: string } | { estado: "rechazada"; motivo: string; inicioEsperado: string }) {
  return pedir<void>(`/solicitudes/${encodeURIComponent(id)}`, { method: "PATCH", headers: await autorizacion(), body: respuesta, cache: "no-store" });
}
