import { env } from "@/lib/env";
import { FavoritosHttpRepo } from "./favoritos.http";
import { FavoritosMockRepo } from "./favoritos.mock";
import type { FavoritosRepo } from "./favoritos.repo";

export const favoritosRepo: FavoritosRepo = env.usarDatosSimulados
  ? new FavoritosMockRepo()
  : new FavoritosHttpRepo();

export type { FavoritosRepo } from "./favoritos.repo";
