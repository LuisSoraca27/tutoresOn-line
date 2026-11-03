import "server-only";
import { tokenSesion } from "@/features/auth/sesion";
import { pedir } from "@/lib/http";
import { DisponibilidadHttpRepo } from "./disponibilidad.http";
import type { BloqueSemanal, Excepcion, ReglasAgenda, Disponibilidad } from "./disponibilidad.types";

class DisponibilidadReal extends DisponibilidadHttpRepo {
  async obtener(tutorId: string) {
    const token = await tokenSesion();
    return pedir<Disponibilidad>(`/tutores/${encodeURIComponent(tutorId)}/disponibilidad`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, cache: "no-store" });
  }
  private async guardar(tutorId: string, parte: string, body: unknown) {
    const token = await tokenSesion();
    if (!token) throw new Error("Tu sesión expiró. Inicia sesión de nuevo.");
    return pedir<Disponibilidad>(`/tutores/${encodeURIComponent(tutorId)}/disponibilidad/${parte}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body, cache: "no-store" });
  }
  guardarBloques(tutorId: string, bloques: BloqueSemanal[]) { return this.guardar(tutorId, "bloques", { bloques }); }
  guardarReglas(tutorId: string, reglas: ReglasAgenda) { return this.guardar(tutorId, "reglas", reglas); }
  guardarExcepciones(tutorId: string, excepciones: Excepcion[]) { return this.guardar(tutorId, "excepciones", { excepciones }); }
}
export const disponibilidadRealRepo = new DisponibilidadReal();
