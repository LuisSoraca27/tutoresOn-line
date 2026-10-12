import { pedir } from "@/lib/http";
import type { FavoritosRepo } from "./favoritos.repo";

export class FavoritosHttpRepo implements FavoritosRepo {
  de(estudianteId: string) {
    return pedir<string[]>("/favoritos", { query: { estudiante_id: estudianteId } });
  }

  alternar(estudianteId: string, tutorId: string) {
    return pedir<boolean>("/favoritos", {
      method: "POST",
      body: { estudiante_id: estudianteId, tutor_id: tutorId },
    });
  }
}
