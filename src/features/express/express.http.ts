import { pedir } from "@/lib/http";
import type { ExpressRepo } from "./express.repo";
import type { NuevaSolicitud, SolicitudExpress } from "./express.types";

export class ExpressHttpRepo implements ExpressRepo {
  crear(nueva: NuevaSolicitud) {
    return pedir<SolicitudExpress>("/express", { method: "POST", body: nueva });
  }

  obtener(id: string) {
    return pedir<SolicitudExpress | null>(`/express/${id}`);
  }

  paraTutor(tutorId: string) {
    return pedir<SolicitudExpress[]>("/express", { query: { tutor_id: tutorId } });
  }

  cancelar(id: string) {
    return pedir<SolicitudExpress>(`/express/${id}/cancelar`, { method: "POST" });
  }

  emparejar(id: string, tutorId: string, reservaId: string) {
    return pedir<SolicitudExpress>(`/express/${id}/emparejar`, {
      method: "POST",
      body: { tutor_id: tutorId, reserva_id: reservaId },
    });
  }

  /** El backend las vence solo; aquí no hay nada que hacer. */
  async vencerCaducadas() {}
}
