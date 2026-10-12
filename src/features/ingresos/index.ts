import { env } from "@/lib/env";
import { IngresosMockRepo } from "./ingresos.mock";
import { IngresosHttpRepo } from "./ingresos.http";
import type { IngresosRepo } from "./ingresos.repo";
export const ingresosRepo: IngresosRepo = env.usarDatosSimulados
  ? new IngresosMockRepo()
  : new IngresosHttpRepo();
export type { Balance, Retiro } from "./ingresos.types";
