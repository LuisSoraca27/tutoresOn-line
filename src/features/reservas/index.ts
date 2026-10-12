import { env } from "@/lib/env";
import { ReservasHttpRepo } from "./reservas.http";
import { ReservasMockRepo } from "./reservas.mock";
import type { ReservasRepo } from "./reservas.repo";

export const reservasRepo: ReservasRepo = env.usarDatosSimulados
  ? new ReservasMockRepo()
  : new ReservasHttpRepo();

export type { ReservasRepo } from "./reservas.repo";
export type { EstadoReserva, NuevaReserva, Reserva } from "./reserva.types";
export { ETIQUETA_ESTADO } from "./reserva.types";
