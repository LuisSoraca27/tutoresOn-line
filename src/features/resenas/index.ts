import { env } from "@/lib/env";
import { ResenasHttpRepo } from "./resenas.http";
import { ResenasMockRepo } from "./resenas.mock";
import type { ResenasRepo } from "./resenas.repo";

export const resenasRepo: ResenasRepo = env.usarDatosSimulados
  ? new ResenasMockRepo()
  : new ResenasHttpRepo();

export type { ResenasRepo } from "./resenas.repo";
export type { NuevaResena, Resena } from "./resena.types";
export { CRITERIOS, combinarReputacion } from "./resena.types";
