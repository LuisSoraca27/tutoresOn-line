import { pedir } from "@/lib/http";
import type { ConsultaTurnos, DisponibilidadRepo } from "./disponibilidad.repo";
import type {
  BloqueSemanal,
  DiaConTurnos,
  Disponibilidad,
  Excepcion,
  ReglasAgenda,
} from "./disponibilidad.types";

export class DisponibilidadHttpRepo implements DisponibilidadRepo {
  obtener(tutorId: string) {
    return pedir<Disponibilidad>(`/tutores/${tutorId}/disponibilidad`);
  }

  guardarBloques(tutorId: string, bloques: BloqueSemanal[]) {
    return pedir<Disponibilidad>(`/tutores/${tutorId}/disponibilidad/bloques`, {
      method: "PUT",
      body: { bloques },
    });
  }

  guardarReglas(tutorId: string, reglas: ReglasAgenda) {
    return pedir<Disponibilidad>(`/tutores/${tutorId}/disponibilidad/reglas`, {
      method: "PUT",
      body: reglas,
    });
  }

  guardarExcepciones(tutorId: string, excepciones: Excepcion[]) {
    return pedir<Disponibilidad>(`/tutores/${tutorId}/disponibilidad/excepciones`, {
      method: "PUT",
      body: { excepciones },
    });
  }

  turnos({ tutorId, desde, dias, duracionMinutos }: ConsultaTurnos) {
    return pedir<DiaConTurnos[]>(`/tutores/${tutorId}/turnos`, {
      query: { desde, dias, duracion_minutos: duracionMinutos },
    });
  }
}
