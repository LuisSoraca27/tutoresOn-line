import { env } from "@/lib/env";
import { TutoresHttpRepo } from "./tutores.http";
import { TutoresMockRepo } from "./tutores.mock";
import type { TutoresRepo } from "./tutores.repo";

/**
 * Las pantallas importan esto y nada más. Cambiar de datos simulados a
 * FastAPI es cambiar una variable de entorno, no tocar componentes.
 */
export const tutoresRepo: TutoresRepo = env.usarDatosSimulados
  ? new TutoresMockRepo()
  : new TutoresHttpRepo();

export type { TutoresRepo };
export type { CambiosPerfil } from "./tutores.repo";
export type { MateriaDictada } from "./tutor.types";
export type {
  FiltrosTutor,
  Modalidad,
  OrdenTutor,
  Pagina,
  Reputacion,
  Tutor,
} from "./tutor.types";
