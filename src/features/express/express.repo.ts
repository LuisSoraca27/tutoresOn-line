import type { NuevaSolicitud, SolicitudExpress } from "./express.types";

export interface ExpressRepo {
  crear(nueva: NuevaSolicitud): Promise<SolicitudExpress>;
  obtener(id: string): Promise<SolicitudExpress | null>;
  /** Solicitudes vivas que le sirven a un tutor, por materia y modalidad. */
  paraTutor(tutorId: string): Promise<SolicitudExpress[]>;
  cancelar(id: string): Promise<SolicitudExpress>;
  emparejar(id: string, tutorId: string, reservaId: string): Promise<SolicitudExpress>;
  /** Marca como vencidas las que pasaron su ventana. */
  vencerCaducadas(): Promise<void>;
}
