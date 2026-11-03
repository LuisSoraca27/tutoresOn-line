import { env } from "@/lib/env";
import { AuthHttpRepo } from "./auth.http";
import { AuthMockRepo } from "./auth.mock";
import type { AuthRepo } from "./auth.repo";

export const authRepo: AuthRepo = env.usarDatosSimulados
  ? new AuthMockRepo()
  : new AuthHttpRepo();

export type { AuthRepo } from "./auth.repo";
export type {
  Credenciales,
  RegistroEstudiante,
  RegistroTutor,
  Usuario,
} from "./auth.types";
export { COOKIE_SESION } from "./auth.types";
