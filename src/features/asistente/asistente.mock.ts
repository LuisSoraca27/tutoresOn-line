import { catalogosRepo } from "@/features/catalogos";
import { demora } from "@/mocks/demora";
import { tutoresRepo, type FiltrosTutor } from "@/features/tutores";
import type { AsistenteRepo } from "./asistente.repo";
import type { Mensaje, RespuestaAsistente } from "./asistente.types";
import { ETIQUETA_NIVEL, interpretar } from "./interpretar";

/**
 * Asistente por reglas.
 *
 * Hace de verdad las dos cosas que importan: entiende el tema aunque el
 * estudiante no sepa cómo se llama la materia, y responde con tutores reales
 * del repositorio, no inventados. Lo que le falta frente al modelo es
 * conversar de temas que no anticipamos, y eso llega con FastAPI.
 */
export class AsistenteMockRepo implements AsistenteRepo {
  async emparejar(consulta: string, historial: Mensaje[]): Promise<RespuestaAsistente> {
    await demora(700);

    const materias = await catalogosRepo.materias();
    const nombres = new Map(materias.map((materia) => [materia.id, materia.nombre]));

    // El turno anterior se arrastra: "mejor presencial" no repite la materia.
    const previos = historial
      .filter((mensaje) => mensaje.autor === "estudiante")
      .map((mensaje) => mensaje.texto);

    const intencion = interpretar([...previos, consulta].join(". "), nombres);

    const pagina = await tutoresRepo.buscar(intencion.filtros);

    // Si no hay nadie con todos los criterios, se aflojan de menos a más
    // importante antes que devolver una lista vacía.
    let tutores = pagina.items;
    let seAflojo: string | null = null;

    if (tutores.length === 0 && intencion.filtros.modalidad) {
      const sinModalidad: FiltrosTutor = { ...intencion.filtros, modalidad: undefined };
      const segunda = await tutoresRepo.buscar(sinModalidad);
      if (segunda.items.length > 0) {
        tutores = segunda.items;
        seAflojo = "modalidad";
      }
    }

    if (tutores.length === 0 && intencion.filtros.nivelId) {
      const sinNivel: FiltrosTutor = { ...intencion.filtros, nivelId: undefined };
      const tercera = await tutoresRepo.buscar(sinNivel);
      if (tercera.items.length > 0) {
        tutores = tercera.items;
        seAflojo = "nivel";
      }
    }

    return {
      texto: redactar(intencion, tutores.length, seAflojo, nombres),
      filtros: intencion.filtros,
      tutorIds: tutores.map((tutor) => tutor.id),
      seguimientos: sugerir(intencion),
      entendido: intencion.entendido,
    };
  }
}

/** Redacta la respuesta en función de lo que se entendió y lo que se encontró. */
function redactar(
  intencion: ReturnType<typeof interpretar>,
  encontrados: number,
  seAflojo: string | null,
  nombres: Map<string, string>,
): string {
  const materia = intencion.filtros.materiaId
    ? nombres.get(intencion.filtros.materiaId)
    : null;

  if (!materia) {
    return (
      "No logro identificar la materia con lo que me contaste. " +
      "Dime el tema concreto que se te está atravesando —por ejemplo “integrales por partes” " +
      "o “conjugación de verbos en francés”— y te busco a alguien que lo dicte."
    );
  }

  const nivel = intencion.filtros.nivelId ? ETIQUETA_NIVEL[intencion.filtros.nivelId] : null;

  if (encontrados === 0) {
    return (
      `Eso es ${materia}${nivel ? `, nivel ${nivel.toLowerCase()}` : ""}, pero ahora mismo ` +
      "no tengo a nadie disponible con esos criterios. Prueba a ampliar el presupuesto o a " +
      "aceptar clases virtuales."
    );
  }

  const partes = [`Eso es ${materia}`];
  if (nivel) partes.push(`a nivel ${nivel.toLowerCase()}`);

  // El aviso de que se aflojó un criterio va antes de la propuesta, no
  // después: si va después, la frase queda partida por los dos puntos.
  const aviso =
    seAflojo === "modalidad"
      ? " Ninguno cumplía la modalidad que pediste, así que te muestro los que hay en la otra."
      : seAflojo === "nivel"
        ? " No encontré a nadie con esos criterios exactos, así que amplié la búsqueda."
        : "";

  const cierre = intencion.faltante.includes("nivel")
    ? " Si me dices en qué nivel estás, afino más."
    : "";

  return (
    `${partes.join(" ")}.${aviso} ` +
    `Te propongo ${encontrados === 1 ? "este tutor" : `estos ${encontrados} tutores`}:${cierre}`
  );
}

/** Preguntas de seguimiento, elegidas por lo que falta saber. */
function sugerir(intencion: ReturnType<typeof interpretar>): string[] {
  const sugerencias: string[] = [];

  if (intencion.faltante.includes("nivel")) {
    sugerencias.push("Es para la universidad", "Es para el colegio");
  }
  if (intencion.faltante.includes("modalidad")) {
    sugerencias.push("Prefiero presencial");
  }
  if (!intencion.filtros.precioMax) {
    sugerencias.push("Que no pase de 50 mil la hora");
  }

  return sugerencias.slice(0, 3);
}
