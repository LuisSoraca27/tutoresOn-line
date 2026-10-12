import type { EstadoReserva, NuevaReserva, Reserva } from "./reserva.types";

export interface ReservasRepo {
  crear(nueva: NuevaReserva): Promise<Reserva>;
  obtener(id: string): Promise<Reserva | null>;
  deEstudiante(estudianteId: string): Promise<Reserva[]>;
  deTutor(tutorId: string): Promise<Reserva[]>;
  /** Sesiones que ocupan la agenda del tutor: pendientes y aceptadas. */
  ocupadas(tutorId: string, desde: string, hasta: string): Promise<Reserva[]>;
  cambiarEstado(
    id: string,
    estado: EstadoReserva,
    motivo?: string,
  ): Promise<Reserva>;
  /** Guarda lo que el tutor registró al cerrar la sesión. */
  registrarCierre(
    id: string,
    cierre: NonNullable<Reserva["cierre"]>,
  ): Promise<Reserva>;
  /** Conserva el código y la tarifa; el nuevo turno vuelve a pedir aceptación. */
  reprogramar(
    id: string,
    inicio: string,
    fin: string,
    inicioAnterior: string,
  ): Promise<Reserva>;
}
