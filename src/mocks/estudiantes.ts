/**
 * Estudiantes de prueba.
 *
 * No hay un dominio de estudiantes todavía —llega con el módulo M1— pero la
 * bandeja del tutor necesita mostrar quién pide la sesión, no un `e-002`
 * suelto. Cuando exista el repositorio real, esto se borra.
 */
export interface EstudianteDemo {
  id: string;
  nombre: string;
  nivelId: string;
}

export const ESTUDIANTES: EstudianteDemo[] = [
  { id: "e-001", nombre: "Sara Betancur", nivelId: "universitario" },
  { id: "e-002", nombre: "Andrés Peñaloza", nivelId: "bachillerato" },
  { id: "e-003", nombre: "Camila Duarte", nivelId: "universitario" },
  { id: "e-004", nombre: "Julián Mesa", nivelId: "bachillerato" },
  { id: "e-005", nombre: "Natalia Ospina", nivelId: "posgrado" },
];

export function nombreEstudiante(id: string): string {
  return ESTUDIANTES.find((estudiante) => estudiante.id === id)?.nombre ?? id;
}
