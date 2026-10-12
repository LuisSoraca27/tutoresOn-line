import { demora } from "@/mocks/demora";
import { almacen } from "@/mocks/almacen";
import type { FiltrosTutor, Pagina, Tutor } from "./tutor.types";
import type { CambiosPerfil, TutoresRepo } from "./tutores.repo";

/** ¿El tutor atiende en la modalidad pedida? "ambas" satisface cualquiera. */
function coincideModalidad(tutor: Tutor, pedida: FiltrosTutor["modalidad"]): boolean {
  if (!pedida || pedida === "ambas") return true;
  return tutor.modalidad === pedida || tutor.modalidad === "ambas";
}

function coincideTexto(tutor: Tutor, q?: string): boolean {
  if (!q) return true;
  const aguja = q.trim().toLowerCase();
  return (
    tutor.nombre.toLowerCase().includes(aguja) ||
    tutor.titulo.toLowerCase().includes(aguja) ||
    tutor.bio.toLowerCase().includes(aguja) ||
    tutor.materias.some((m) => m.materiaId.includes(aguja))
  );
}

function aplicarFiltros(tutores: Tutor[], f: FiltrosTutor): Tutor[] {
  return tutores.filter((tutor) => {
    if (!coincideTexto(tutor, f.q)) return false;
    if (f.materiaId && !tutor.materias.some((m) => m.materiaId === f.materiaId)) return false;
    if (f.nivelId && !tutor.materias.some((m) => m.nivelIds.includes(f.nivelId!))) return false;
    if (!coincideModalidad(tutor, f.modalidad)) return false;
    if (f.ciudadId && tutor.ciudadId !== f.ciudadId && tutor.modalidad !== "virtual") return false;
    if (f.precioMax !== undefined && tutor.precioDesde > f.precioMax) return false;
    if (f.calificacionMin !== undefined && tutor.reputacion.promedio < f.calificacionMin) return false;
    if (f.soloVerificados && !tutor.verificado) return false;
    return true;
  });
}

/**
 * Orden de relevancia: primero verificados, luego mejor calificados y
 * con más sesiones. Es la misma regla que deberá replicar FastAPI.
 */
function ordenar(tutores: Tutor[], orden: FiltrosTutor["orden"]): Tutor[] {
  const copia = [...tutores];
  switch (orden) {
    case "precio-asc":
      return copia.sort((a, b) => a.precioDesde - b.precioDesde);
    case "precio-desc":
      return copia.sort((a, b) => b.precioDesde - a.precioDesde);
    case "calificacion":
      return copia.sort((a, b) => b.reputacion.promedio - a.reputacion.promedio);
    case "sesiones":
      return copia.sort((a, b) => b.sesionesCompletadas - a.sesionesCompletadas);
    default:
      return copia.sort(
        (a, b) =>
          Number(b.verificado) - Number(a.verificado) ||
          b.reputacion.promedio - a.reputacion.promedio ||
          b.sesionesCompletadas - a.sesionesCompletadas,
      );
  }
}

export class TutoresMockRepo implements TutoresRepo {
  async buscar(filtros: FiltrosTutor): Promise<Pagina<Tutor>> {
    await demora();

    const pagina = filtros.pagina ?? 1;
    const porPagina = filtros.porPagina ?? 9;
    const encontrados = ordenar(aplicarFiltros(almacen.tutores, filtros), filtros.orden);
    const desde = (pagina - 1) * porPagina;

    return {
      items: encontrados.slice(desde, desde + porPagina),
      total: encontrados.length,
      pagina,
      porPagina,
    };
  }

  async obtener(id: string): Promise<Tutor | null> {
    await demora();
    return almacen.tutores.find((tutor) => tutor.id === id) ?? null;
  }

  async destacados(limite = 6): Promise<Tutor[]> {
    await demora();
    return ordenar(almacen.tutores, "relevancia").slice(0, limite);
  }

  async actualizar(id: string, cambios: CambiosPerfil): Promise<Tutor> {
    await demora(350);

    const tutor = almacen.tutores.find((candidato) => candidato.id === id);
    if (!tutor) throw new Error("No encontramos ese perfil.");

    Object.assign(tutor, cambios);

    // El precio "desde" no se edita: se deriva de las tarifas por materia,
    // así que la tarjeta de resultados nunca puede mentir.
    if (cambios.materias && cambios.materias.length > 0) {
      tutor.precioDesde = Math.min(...cambios.materias.map((materia) => materia.precioHora));
    }

    return tutor;
  }
}
