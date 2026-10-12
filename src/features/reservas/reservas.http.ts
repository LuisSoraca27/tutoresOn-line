import { pedir } from "@/lib/http";
import type { ReservasRepo } from "./reservas.repo";
import type { EstadoReserva, NuevaReserva, Reserva } from "./reserva.types";

export class ReservasHttpRepo implements ReservasRepo {
  reprogramar(id: string, inicio: string, fin: string, inicioAnterior: string) {
    return pedir<Reserva>(`/reservas/${id}/reprogramar`, {
      method: "PATCH",
      body: { inicio, fin, inicioAnterior },
    });
  }

  crear(nueva: NuevaReserva) {
    return pedir<Reserva>("/reservas", { method: "POST", body: nueva });
  }

  obtener(id: string) {
    return pedir<Reserva | null>(`/reservas/${id}`);
  }

  deEstudiante(estudianteId: string) {
    return pedir<Reserva[]>("/reservas", {
      query: { estudiante_id: estudianteId },
    });
  }

  deTutor(tutorId: string) {
    return pedir<Reserva[]>("/reservas", { query: { tutor_id: tutorId } });
  }

  ocupadas(tutorId: string, desde: string, hasta: string) {
    return pedir<Reserva[]>("/reservas", {
      query: { tutor_id: tutorId, desde, hasta, ocupan: true },
    });
  }

  registrarCierre(id: string, cierre: NonNullable<Reserva["cierre"]>) {
    return pedir<Reserva>(`/reservas/${id}/cierre`, {
      method: "PUT",
      body: cierre,
    });
  }

  cambiarEstado(id: string, estado: EstadoReserva, motivo?: string) {
    return pedir<Reserva>(`/reservas/${id}/estado`, {
      method: "PATCH",
      body: { estado, motivo },
    });
  }
}
