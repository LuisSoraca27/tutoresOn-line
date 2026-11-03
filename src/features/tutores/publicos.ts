import { TutoresHttpRepo } from "./tutores.http";

// Las páginas públicas consultan perfiles persistidos; los demás módulos de
// demostración conservan su repositorio hasta que tengan API propia.
export const tutoresPublicosRepo = new TutoresHttpRepo();
