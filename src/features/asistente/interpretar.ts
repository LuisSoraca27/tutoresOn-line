import type { NivelId } from "@/features/catalogos/catalogo.types";
import type { FiltrosTutor, Modalidad } from "@/features/tutores";

/**
 * Intérprete de lenguaje natural, versión sin modelo.
 *
 * Cuando el backend esté en pie, esto lo hará Claude a través de FastAPI y
 * devolverá el mismo objeto. Mientras tanto, un intérprete por reglas cubre
 * el caso real —el estudiante nombra el tema, no la materia del catálogo— y
 * deja la interfaz completa y demostrable sin depender de una clave de API.
 *
 * Es una función pura: entra texto, sale intención. Se puede probar sola y
 * sirve de especificación de lo que el backend tiene que responder.
 */

export interface Intencion {
  filtros: FiltrosTutor;
  entendido: { campo: string; valor: string }[];
  /** Lo que no se pudo deducir y conviene preguntar. */
  faltante: ("materia" | "nivel" | "modalidad")[];
}

/** Cada materia con las palabras por las que la gente la nombra de verdad. */
const PISTAS_MATERIA: Record<string, string[]> = {
  calculo: [
    "calculo", "derivada", "derivadas", "integral", "integrales", "limite", "limites",
    "regla de la cadena", "diferencial", "continuidad",
  ],
  algebra: ["algebra", "ecuacion", "ecuaciones", "polinomio", "factorizacion", "matriz", "matrices"],
  estadistica: [
    "estadistica", "probabilidad", "hipotesis", "regresion", "media", "desviacion",
    "muestreo", "spss",
  ],
  fisica: ["fisica", "cinematica", "dinamica", "newton", "termodinamica", "ondas", "optica"],
  quimica: ["quimica", "organica", "estequiometria", "mol", "moles", "reaccion", "tabla periodica"],
  biologia: ["biologia", "celula", "genetica", "adn", "ecosistema", "evolucion"],
  programacion: [
    "programacion", "programar", "python", "java", "javascript", "codigo", "algoritmo",
    "recursion", "poo", "objetos",
  ],
  "bases-datos": ["base de datos", "bases de datos", "sql", "consulta", "postgres", "mysql", "modelo entidad"],
  ingles: ["ingles", "english", "toefl", "ielts", "conversacional", "speaking", "gramatica inglesa"],
  frances: ["frances", "french", "delf"],
  lenguaje: ["lengua", "castellano", "espanol", "ortografia", "redaccion", "ensayo", "comprension lectora"],
  historia: ["historia", "sociales", "geografia", "colombia", "independencia"],
  contabilidad: ["contabilidad", "contable", "balance", "asiento", "costos", "finanzas"],
};

const PISTAS_NIVEL: Record<NivelId, string[]> = {
  primaria: ["primaria", "nino", "nina", "hijo", "hija", "quinto", "cuarto", "tercero", "escuela"],
  bachillerato: ["bachillerato", "colegio", "once", "decimo", "noveno", "octavo", "icfes", "saber 11"],
  tecnico: ["tecnico", "tecnologo", "sena", "tecnologia"],
  universitario: [
    "universidad", "universitario", "parcial", "semestre", "carrera", "pregrado", "supletorio",
    "habilitacion",
  ],
  posgrado: ["posgrado", "maestria", "master", "doctorado", "tesis", "especializacion"],
};

const PISTAS_MODALIDAD: Record<Exclude<Modalidad, "ambas">, string[]> = {
  presencial: ["presencial", "en persona", "en mi casa", "cerca", "domicilio", "vernos"],
  virtual: ["virtual", "en linea", "online", "por videollamada", "remoto", "a distancia"],
};

const PISTAS_URGENCIA = ["urgente", "hoy", "manana", "ya", "ahora", "esta semana", "pasado manana"];

const PISTAS_PRECIO = ["barato", "economico", "que no sea caro", "poco presupuesto", "ajustado"];

/** Quita tildes y baja a minúsculas: "Cálculo" y "calculo" tienen que ser lo mismo. */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buscarPista(texto: string, pistas: string[]): string | null {
  return pistas.find((pista) => texto.includes(pista)) ?? null;
}

export function interpretar(consulta: string, nombresMateria: Map<string, string>): Intencion {
  const texto = normalizar(consulta);
  const entendido: { campo: string; valor: string }[] = [];
  const filtros: FiltrosTutor = { orden: "relevancia", pagina: 1, porPagina: 3 };

  // Materia: gana la que tenga la pista más específica (la más larga).
  let mejorMateria: { id: string; pista: string } | null = null;
  for (const [id, pistas] of Object.entries(PISTAS_MATERIA)) {
    const pista = buscarPista(texto, pistas);
    if (pista && (!mejorMateria || pista.length > mejorMateria.pista.length)) {
      mejorMateria = { id, pista };
    }
  }

  if (mejorMateria) {
    filtros.materiaId = mejorMateria.id;
    entendido.push({
      campo: "Materia",
      valor: nombresMateria.get(mejorMateria.id) ?? mejorMateria.id,
    });
  }

  for (const [id, pistas] of Object.entries(PISTAS_NIVEL)) {
    if (buscarPista(texto, pistas)) {
      filtros.nivelId = id as NivelId;
      entendido.push({ campo: "Nivel", valor: ETIQUETA_NIVEL[id as NivelId] });
      break;
    }
  }

  for (const [id, pistas] of Object.entries(PISTAS_MODALIDAD)) {
    if (buscarPista(texto, pistas)) {
      filtros.modalidad = id as Modalidad;
      entendido.push({ campo: "Modalidad", valor: id === "virtual" ? "Virtual" : "Presencial" });
      break;
    }
  }

  if (buscarPista(texto, PISTAS_URGENCIA)) {
    entendido.push({ campo: "Urgencia", valor: "Lo antes posible" });
  }

  if (buscarPista(texto, PISTAS_PRECIO)) {
    filtros.orden = "precio-asc";
    entendido.push({ campo: "Presupuesto", valor: "Ajustado" });
  }

  // Tope de precio. Cubre las formas en que la gente lo dice de verdad:
  // "máximo 50 mil", "hasta 45.000", "que no pase de 60 mil".
  const tope = texto.match(
    /(?:maximo|hasta|menos de|no pase de|no mas de|tope de|no supere)\s+\$?\s*([\d.,]+)\s*(mil)?/,
  );

  if (tope) {
    const crudo = Number(tope[1].replace(/[.,]/g, ""));
    // "50 mil" son 50 000; "45.000" ya viene completo.
    const valor = tope[2] && crudo < 1000 ? crudo * 1000 : crudo;

    if (Number.isFinite(valor) && valor >= 10000 && valor <= 200000) {
      filtros.precioMax = valor;
      entendido.push({ campo: "Precio máximo", valor: `$ ${valor.toLocaleString("es-CO")}` });
    }
  }

  const faltante: Intencion["faltante"] = [];
  if (!filtros.materiaId) faltante.push("materia");
  if (!filtros.nivelId) faltante.push("nivel");
  if (!filtros.modalidad) faltante.push("modalidad");

  return { filtros, entendido, faltante };
}

export const ETIQUETA_NIVEL: Record<NivelId, string> = {
  primaria: "Primaria",
  bachillerato: "Bachillerato",
  tecnico: "Técnico y tecnólogo",
  universitario: "Universitario",
  posgrado: "Posgrado",
};
