import { almacen, siguienteId } from "@/mocks/almacen";
import { demora } from "@/mocks/demora";
import { tutoresRepo } from "@/features/tutores";
import type { ExpressRepo } from "./express.repo";
import type { NuevaSolicitud, SolicitudExpress } from "./express.types";
import { MINUTOS_VIGENCIA } from "./express.types";

export class ExpressMockRepo implements ExpressRepo {
  async crear(nueva: NuevaSolicitud): Promise<SolicitudExpress> {
    await demora(300);

    // Una solicitud viva a la vez: dos búsquedas simultáneas del mismo
    // estudiante terminarían en dos tutores para la misma hora.
    const viva = almacen.solicitudes.find(
      (solicitud) =>
        solicitud.estudianteId === nueva.estudianteId && solicitud.estado === "buscando",
    );
    if (viva) throw new Error("Ya tienes una búsqueda en curso.");

    const solicitud: SolicitudExpress = {
      ...nueva,
      id: siguienteId("EX"),
      estado: "buscando",
      creadaEn: new Date().toISOString(),
    };

    almacen.solicitudes.unshift(solicitud);
    return solicitud;
  }

  async obtener(id: string): Promise<SolicitudExpress | null> {
    await this.vencerCaducadas();
    return almacen.solicitudes.find((solicitud) => solicitud.id === id) ?? null;
  }

  async paraTutor(tutorId: string): Promise<SolicitudExpress[]> {
    await this.vencerCaducadas();

    const tutor = await tutoresRepo.obtener(tutorId);
    if (!tutor || !tutor.disponibleAhora) return [];

    // Al tutor solo le llegan las que puede atender: materia que dicta, en
    // el nivel que dicta y en una modalidad que ofrece.
    return almacen.solicitudes.filter((solicitud) => {
      if (solicitud.estado !== "buscando") return false;

      const dictada = tutor.materias.find(
        (materia) => materia.materiaId === solicitud.materiaId,
      );
      if (!dictada || !dictada.nivelIds.includes(solicitud.nivelId)) return false;

      return tutor.modalidad === "ambas" || tutor.modalidad === solicitud.modalidad;
    });
  }

  async cancelar(id: string): Promise<SolicitudExpress> {
    await demora(150);

    const solicitud = almacen.solicitudes.find((candidata) => candidata.id === id);
    if (!solicitud) throw new Error("No encontramos esa búsqueda.");

    if (solicitud.estado === "buscando") solicitud.estado = "cancelada";
    return solicitud;
  }

  async emparejar(id: string, tutorId: string, reservaId: string): Promise<SolicitudExpress> {
    await demora(200);

    const solicitud = almacen.solicitudes.find((candidata) => candidata.id === id);
    if (!solicitud) throw new Error("No encontramos esa búsqueda.");

    // El primero que llega se la queda: si ya no está buscando, se perdió.
    if (solicitud.estado !== "buscando") {
      throw new Error("Otro tutor tomó esta solicitud primero.");
    }

    solicitud.estado = "emparejada";
    solicitud.tutorId = tutorId;
    solicitud.reservaId = reservaId;

    return solicitud;
  }

  async vencerCaducadas(): Promise<void> {
    const limite = Date.now() - MINUTOS_VIGENCIA * 60 * 1000;

    for (const solicitud of almacen.solicitudes) {
      if (solicitud.estado === "buscando" && new Date(solicitud.creadaEn).getTime() < limite) {
        solicitud.estado = "expirada";
      }
    }
  }
}
