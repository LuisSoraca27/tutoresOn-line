import { pedir } from "@/lib/http";
import type { ResenasRepo } from "./resenas.repo";
import type { NuevaResena, Resena } from "./resena.types";

export class ResenasHttpRepo implements ResenasRepo {
  crear(nueva: NuevaResena) {
    return pedir<Resena>("/resenas", { method: "POST", body: nueva });
  }

  deTutor(tutorId: string) {
    return pedir<Resena[]>("/resenas", { query: { tutor_id: tutorId } });
  }

  deReserva(reservaId: string) {
    return pedir<Resena | null>("/resenas", { query: { reserva_id: reservaId } });
  }

  responder(id: string, texto: string) {
    return pedir<Resena>(`/resenas/${id}/respuesta`, { method: "PUT", body: { texto } });
  }

  reportar(id: string, motivo: string) {
    return pedir<Resena>(`/resenas/${id}/reporte`, { method: "POST", body: { motivo } });
  }
}
