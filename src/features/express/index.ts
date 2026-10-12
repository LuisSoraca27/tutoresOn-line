import { env } from "@/lib/env";
import { ExpressHttpRepo } from "./express.http";
import { ExpressMockRepo } from "./express.mock";
import type { ExpressRepo } from "./express.repo";

export const expressRepo: ExpressRepo = env.usarDatosSimulados
  ? new ExpressMockRepo()
  : new ExpressHttpRepo();

export type { ExpressRepo } from "./express.repo";
export type { EstadoSolicitud, NuevaSolicitud, SolicitudExpress } from "./express.types";
export { MINUTOS_VIGENCIA, SEGUNDOS_SONDEO } from "./express.types";
