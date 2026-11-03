import "server-only";
import { pedir } from "@/lib/http";

export interface ResenaPublica {
  id: string;
  estudianteNombre: string;
  puntaje: number;
  comentario: string;
  criterios: { puntualidad: number; claridad: number; dominio: number } | null;
  respuestaTutor: string | null;
  creadaEn: string;
}
export async function resenasDeTutor(tutorId: string) {
  return pedir<ResenaPublica[]>(`/tutores/${encodeURIComponent(tutorId)}/resenas`, { cache: "no-store" });
}
