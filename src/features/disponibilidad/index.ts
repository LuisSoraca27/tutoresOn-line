import { env } from "@/lib/env";
import { DisponibilidadHttpRepo } from "./disponibilidad.http";
import { DisponibilidadMockRepo } from "./disponibilidad.mock";
import type { DisponibilidadRepo } from "./disponibilidad.repo";

export const disponibilidadRepo: DisponibilidadRepo = env.usarDatosSimulados
  ? new DisponibilidadMockRepo()
  : new DisponibilidadHttpRepo();

export type { ConsultaTurnos, DisponibilidadRepo } from "./disponibilidad.repo";
export type {
  BloqueSemanal,
  DiaConTurnos,
  DiaSemana,
  Disponibilidad,
  Excepcion,
  ReglasAgenda,
  Turno,
} from "./disponibilidad.types";
export { DIAS, REGLAS_POR_DEFECTO } from "./disponibilidad.types";
