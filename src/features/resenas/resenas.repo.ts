import type { NuevaResena, Resena } from "./resena.types";

export interface ResenasRepo {
  crear(nueva: NuevaResena): Promise<Resena>;
  deTutor(tutorId: string): Promise<Resena[]>;
  /** La reseña de una reserva concreta, si ya se escribió. */
  deReserva(reservaId: string): Promise<Resena | null>;
  responder(id: string, texto: string): Promise<Resena>;
  /** Denunciar una reseña. */
  reportar(id: string, motivo: string): Promise<Resena>;
}
