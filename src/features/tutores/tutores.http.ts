import { pedir } from "@/lib/http";
import type { FiltrosTutor, Pagina, Tutor } from "./tutor.types";
import type { CambiosPerfil, TutoresRepo } from "./tutores.repo";

export class TutoresHttpRepo implements TutoresRepo {
  buscar(filtros: FiltrosTutor) {
    return pedir<Pagina<Tutor>>("/tutores", {
      query: {
        q: filtros.q,
        materia_id: filtros.materiaId,
        nivel_id: filtros.nivelId,
        modalidad: filtros.modalidad,
        ciudad_id: filtros.ciudadId,
        precio_max: filtros.precioMax,
        calificacion_min: filtros.calificacionMin,
        solo_verificados: filtros.soloVerificados,
        orden: filtros.orden,
        pagina: filtros.pagina,
        por_pagina: filtros.porPagina,
      },
    });
  }

  obtener(id: string) {
    return pedir<Tutor | null>(`/tutores/${id}`);
  }

  destacados(limite = 6) {
    return pedir<Tutor[]>("/tutores/destacados", { query: { limite } });
  }

  actualizar(id: string, cambios: CambiosPerfil) {
    return pedir<Tutor>(`/tutores/${id}`, { method: "PATCH", body: cambios });
  }
}
