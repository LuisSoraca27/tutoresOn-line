import { pedir } from "@/lib/http";
import { env } from "@/lib/env";
import type { FiltrosTutor, Pagina, Tutor } from "./tutor.types";
import type { CambiosPerfil, TutoresRepo } from "./tutores.repo";

export class TutoresHttpRepo implements TutoresRepo {
  async buscar(filtros: FiltrosTutor) {
    const pagina = await pedir<Pagina<Tutor>>("/tutores", {
      cache: "no-store",
      query: {
        q: filtros.q,
        area: filtros.area,
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
    return { ...pagina, items: pagina.items.map(normalizarFoto) };
  }

  async obtener(id: string) {
    const tutor = await pedir<Tutor | null>(`/tutores/${encodeURIComponent(id)}`, { cache: "no-store" });
    return tutor ? normalizarFoto(tutor) : null;
  }

  async destacados(limite = 6) {
    const tutores = await pedir<Tutor[]>("/tutores/destacados", { query: { limite }, cache: "no-store" });
    return tutores.map(normalizarFoto);
  }

  actualizar(id: string, cambios: CambiosPerfil) {
    return pedir<Tutor>(`/tutores/${id}`, { method: "PATCH", body: cambios });
  }
}

function normalizarFoto(tutor: Tutor): Tutor {
  return tutor.avatarUrl?.startsWith("/api/v1/tutores/") ? { ...tutor, avatarUrl: new URL(tutor.avatarUrl, env.apiUrl).toString() } : tutor;
}
