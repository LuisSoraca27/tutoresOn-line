import { env } from "@/lib/env";
import { ApuntesMockRepo } from "./apuntes.mock";
import { ApuntesHttpRepo } from "./apuntes.http";
import type { ApuntesRepo } from "./apuntes.repo";
export const apuntesRepo: ApuntesRepo = env.usarDatosSimulados
  ? new ApuntesMockRepo()
  : new ApuntesHttpRepo();
