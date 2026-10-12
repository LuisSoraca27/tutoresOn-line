import type { BloqueSemanal, Disponibilidad } from "@/features/disponibilidad/disponibilidad.types";
import { REGLAS_POR_DEFECTO } from "@/features/disponibilidad/disponibilidad.types";

/** Atajo para escribir horarios sin repetir la forma del objeto. */
function bloque(id: string, dia: BloqueSemanal["dia"], inicio: string, fin: string): BloqueSemanal {
  return { id, dia, inicio, fin };
}

/**
 * Horarios de partida. Solo tres tutores traen agenda cargada: los demás
 * aparecen sin disponibilidad, que es justo el caso que hay que ver bien
 * en la interfaz (F3.2 tiene que decirlo, no quedarse en blanco).
 */
export const DISPONIBILIDADES: Record<string, Disponibilidad> = {
  "t-001": {
    tutorId: "t-001",
    bloques: [
      bloque("b1", 1, "08:00", "12:00"),
      bloque("b2", 1, "14:00", "18:00"),
      bloque("b3", 3, "08:00", "12:00"),
      bloque("b4", 3, "14:00", "18:00"),
      bloque("b5", 5, "09:00", "13:00"),
      bloque("b6", 6, "09:00", "12:00"),
    ],
    excepciones: [],
    reglas: REGLAS_POR_DEFECTO,
  },

  "t-002": {
    tutorId: "t-002",
    bloques: [
      bloque("b1", 2, "18:00", "21:00"),
      bloque("b2", 4, "18:00", "21:00"),
      bloque("b3", 6, "08:00", "12:00"),
    ],
    excepciones: [],
    reglas: { duraciones: [60, 90], descansoMinutos: 0, antelacionHoras: 24 },
  },

  "t-003": {
    tutorId: "t-003",
    bloques: [
      bloque("b1", 1, "07:00", "11:00"),
      bloque("b2", 2, "07:00", "11:00"),
      bloque("b3", 3, "07:00", "11:00"),
      bloque("b4", 4, "07:00", "11:00"),
      bloque("b5", 5, "07:00", "11:00"),
    ],
    excepciones: [],
    reglas: { duraciones: [45, 60], descansoMinutos: 15, antelacionHoras: 6 },
  },
};
