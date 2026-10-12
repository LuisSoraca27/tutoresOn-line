import { almacen } from "@/mocks/almacen";
import { demora } from "@/mocks/demora";
import { calcularTurnos } from "./calcular-turnos";
import type { ConsultaTurnos, DisponibilidadRepo } from "./disponibilidad.repo";
import type {
  BloqueSemanal,
  Disponibilidad,
  Excepcion,
  ReglasAgenda,
} from "./disponibilidad.types";
import { REGLAS_POR_DEFECTO } from "./disponibilidad.types";

/** Un tutor sin agenda cargada no es un error: simplemente no tiene turnos. */
function vacia(tutorId: string): Disponibilidad {
  return { tutorId, bloques: [], excepciones: [], reglas: REGLAS_POR_DEFECTO };
}

export class DisponibilidadMockRepo implements DisponibilidadRepo {
  async obtener(tutorId: string): Promise<Disponibilidad> {
    await demora(200);
    return almacen.disponibilidades[tutorId] ?? vacia(tutorId);
  }

  async guardarBloques(tutorId: string, bloques: BloqueSemanal[]): Promise<Disponibilidad> {
    await demora(200);
    const actual = almacen.disponibilidades[tutorId] ?? vacia(tutorId);
    const actualizada: Disponibilidad = { ...actual, bloques };
    almacen.disponibilidades[tutorId] = actualizada;
    return actualizada;
  }

  async guardarReglas(tutorId: string, reglas: ReglasAgenda): Promise<Disponibilidad> {
    await demora(200);
    const actual = almacen.disponibilidades[tutorId] ?? vacia(tutorId);
    const actualizada: Disponibilidad = { ...actual, reglas };
    almacen.disponibilidades[tutorId] = actualizada;
    return actualizada;
  }

  async guardarExcepciones(tutorId: string, excepciones: Excepcion[]): Promise<Disponibilidad> {
    await demora(200);
    const actual = almacen.disponibilidades[tutorId] ?? vacia(tutorId);
    const actualizada: Disponibilidad = { ...actual, excepciones };
    almacen.disponibilidades[tutorId] = actualizada;
    return actualizada;
  }

  async turnos({ tutorId, desde, dias, duracionMinutos }: ConsultaTurnos) {
    await demora(250);

    const disponibilidad = almacen.disponibilidades[tutorId] ?? vacia(tutorId);

    // Una sesión pendiente ocupa el turno igual que una aceptada: si no,
    // dos estudiantes podrían pedir la misma hora antes de que el tutor
    // responda a la primera.
    const ocupados = almacen.reservas
      .filter(
        (reserva) =>
          reserva.tutorId === tutorId &&
          (reserva.estado === "pendiente" ||
            reserva.estado === "aceptada" ||
            reserva.estado === "en-curso"),
      )
      .map((reserva) => ({ inicio: reserva.inicio, fin: reserva.fin }));

    return calcularTurnos({ disponibilidad, desde, dias, duracionMinutos, ocupados });
  }
}
