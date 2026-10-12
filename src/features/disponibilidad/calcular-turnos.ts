import type { DiaConTurnos, Disponibilidad, DiaSemana, Turno } from "./disponibilidad.types";

/**
 * El corazón del Sprint 3: convierte el horario semanal del tutor en los
 * turnos concretos que ve el estudiante.
 *
 * Es una función pura, sin React ni fechas con zona horaria: recibe datos y
 * devuelve datos. Por eso se puede probar sola, y por eso FastAPI puede
 * reimplementarla exactamente igual — el backend tendrá que hacerlo, porque
 * nunca hay que confiar en que el turno que llega del navegador sea válido.
 *
 * Todo se trabaja en la hora local del tutor, en texto "AAAA-MM-DDTHH:mm".
 * Manejar la zona horaria del estudiante es F3.3 y llega después.
 */

export interface OpcionesTurnos {
  disponibilidad: Disponibilidad;
  /** Primer día a considerar, "AAAA-MM-DD". */
  desde: string;
  /** Cuántos días hacia adelante mirar. */
  dias: number;
  /** Duración de la sesión pedida, en minutos. */
  duracionMinutos: number;
  /** Sesiones ya reservadas, para no ofrecer el mismo turno dos veces. */
  ocupados?: { inicio: string; fin: string }[];
  /** Inyectable para poder probar la antelación mínima. */
  ahora?: Date;
}

// ---------------------------------------------------------------- utilidades

/** "09:30" → 570 */
export function aMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

/** 570 → "09:30" */
export function aHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "2026-09-03" → Date local (sin desfase de zona horaria). */
export function aFecha(iso: string): Date {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

/** Date → "2026-09-03" */
export function aIsoFecha(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** Date → "2026-09-03T14:30" en hora local. */
export function aIsoFechaHora(fecha: Date): string {
  const hora = String(fecha.getHours()).padStart(2, "0");
  const minuto = String(fecha.getMinutes()).padStart(2, "0");
  return `${aIsoFecha(fecha)}T${hora}:${minuto}`;
}

function sumarDias(fecha: Date, dias: number): Date {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

/** Dos intervalos se pisan si uno empieza antes de que el otro termine. */
function seCruzan(aInicio: string, aFin: string, bInicio: string, bFin: string): boolean {
  return aInicio < bFin && bInicio < aFin;
}

// ------------------------------------------------------------------- cálculo

export function calcularTurnos({
  disponibilidad,
  desde,
  dias,
  duracionMinutos,
  ocupados = [],
  ahora = new Date(),
}: OpcionesTurnos): DiaConTurnos[] {
  const { bloques, excepciones, reglas } = disponibilidad;

  // Nadie puede reservar para dentro de un rato: hay una antelación mínima.
  const limite = new Date(ahora.getTime() + reglas.antelacionHoras * 60 * 60 * 1000);
  const limiteIso = aIsoFechaHora(limite);

  const fechasBloqueadas = new Set(excepciones.map((excepcion) => excepcion.fecha));
  const inicio = aFecha(desde);

  const resultado: DiaConTurnos[] = [];

  for (let indice = 0; indice < dias; indice += 1) {
    const fecha = sumarDias(inicio, indice);
    const isoFecha = aIsoFecha(fecha);

    if (fechasBloqueadas.has(isoFecha)) {
      resultado.push({ fecha: isoFecha, turnos: [] });
      continue;
    }

    const delDia = bloques
      .filter((bloque) => bloque.dia === (fecha.getDay() as DiaSemana))
      .sort((a, b) => aMinutos(a.inicio) - aMinutos(b.inicio));

    const turnos: Turno[] = [];

    for (const bloque of delDia) {
      const finBloque = aMinutos(bloque.fin);
      const paso = duracionMinutos + reglas.descansoMinutos;

      for (
        let comienzo = aMinutos(bloque.inicio);
        comienzo + duracionMinutos <= finBloque;
        comienzo += paso
      ) {
        const horaInicio = aHora(comienzo);
        const horaFin = aHora(comienzo + duracionMinutos);
        const turnoInicio = `${isoFecha}T${horaInicio}`;
        const turnoFin = `${isoFecha}T${horaFin}`;

        if (turnoInicio < limiteIso) continue;

        const chocado = ocupados.some((sesion) =>
          seCruzan(turnoInicio, turnoFin, sesion.inicio, sesion.fin),
        );
        if (chocado) continue;

        turnos.push({ inicio: turnoInicio, fin: turnoFin, horaInicio, horaFin });
      }
    }

    resultado.push({ fecha: isoFecha, turnos });
  }

  return resultado;
}

/** ¿El tutor tiene al menos un turno libre en este rango? */
export function hayTurnos(dias: DiaConTurnos[]): boolean {
  return dias.some((dia) => dia.turnos.length > 0);
}
