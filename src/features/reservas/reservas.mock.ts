import { almacen, siguienteId } from "@/mocks/almacen";
import { demora } from "@/mocks/demora";
import type { ReservasRepo } from "./reservas.repo";
import type { EstadoReserva, NuevaReserva, Reserva } from "./reserva.types";

/** Estados que bloquean la agenda del tutor. */
const OCUPAN: EstadoReserva[] = ["pendiente", "aceptada", "en-curso"];

export class ReservasMockRepo implements ReservasRepo {
  async reprogramar(
    id: string,
    inicio: string,
    fin: string,
    inicioAnterior: string,
  ): Promise<Reserva> {
    await demora(250);
    const actual = almacen.reservas.find((reserva) => reserva.id === id);
    if (
      !actual ||
      actual.inicio !== inicioAnterior ||
      !["pendiente", "aceptada"].includes(actual.estado)
    ) {
      throw new Error(
        "La reserva cambió. Recarga la página antes de reprogramar.",
      );
    }
    if (
      almacen.reservas.some(
        (otra) =>
          otra.id !== id &&
          otra.tutorId === actual.tutorId &&
          OCUPAN.includes(otra.estado) &&
          inicio < otra.fin &&
          otra.inicio < fin,
      )
    ) {
      throw new Error("Ese turno acaba de ocuparse. Elige otro horario.");
    }
    Object.assign(actual, { inicio, fin, estado: "pendiente" });
    return actual;
  }

  async crear(nueva: NuevaReserva): Promise<Reserva> {
    await demora(400);

    // El turno se vuelve a comprobar aquí, no solo en la interfaz: entre que
    // el estudiante lo eligió y confirmó, otro pudo haberlo tomado.
    const chocado = almacen.reservas.some(
      (reserva) =>
        reserva.tutorId === nueva.tutorId &&
        OCUPAN.includes(reserva.estado) &&
        nueva.inicio < reserva.fin &&
        reserva.inicio < nueva.fin,
    );

    if (chocado) {
      throw new Error(
        "Ese horario acaba de ocuparse. Elige otro turno disponible.",
      );
    }

    const reserva: Reserva = {
      ...nueva,
      id: siguienteId("R"),
      estado: "pendiente",
      creadaEn: new Date().toISOString(),
    };

    almacen.reservas.push(reserva);
    return reserva;
  }

  async obtener(id: string): Promise<Reserva | null> {
    await demora(150);
    return almacen.reservas.find((reserva) => reserva.id === id) ?? null;
  }

  async deEstudiante(estudianteId: string): Promise<Reserva[]> {
    await demora(200);
    return almacen.reservas
      .filter((reserva) => reserva.estudianteId === estudianteId)
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
  }

  async deTutor(tutorId: string): Promise<Reserva[]> {
    await demora(200);
    return almacen.reservas
      .filter((reserva) => reserva.tutorId === tutorId)
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
  }

  async ocupadas(
    tutorId: string,
    desde: string,
    hasta: string,
  ): Promise<Reserva[]> {
    await demora(150);
    return almacen.reservas.filter(
      (reserva) =>
        reserva.tutorId === tutorId &&
        OCUPAN.includes(reserva.estado) &&
        reserva.inicio >= desde &&
        reserva.inicio <= hasta,
    );
  }

  async registrarCierre(
    id: string,
    cierre: NonNullable<Reserva["cierre"]>,
  ): Promise<Reserva> {
    await demora(200);

    const reserva = almacen.reservas.find((candidata) => candidata.id === id);
    if (!reserva) throw new Error("No encontramos esa reserva.");

    reserva.cierre = cierre;
    return reserva;
  }

  async cambiarEstado(
    id: string,
    estado: EstadoReserva,
    motivo?: string,
  ): Promise<Reserva> {
    await demora(250);

    const reserva = almacen.reservas.find((candidata) => candidata.id === id);
    if (!reserva) throw new Error("No encontramos esa reserva.");

    reserva.estado = estado;
    if (motivo) reserva.motivoRechazo = motivo;

    return reserva;
  }
}
