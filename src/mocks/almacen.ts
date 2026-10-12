import type { Disponibilidad } from "@/features/disponibilidad/disponibilidad.types";
import type { Notificacion } from "@/features/notificaciones/notificacion.types";
import type { SolicitudExpress } from "@/features/express/express.types";
import type { Reserva } from "@/features/reservas/reserva.types";
import type { Resena } from "@/features/resenas/resena.types";
import type { Conversacion, Mensaje } from "@/features/mensajes/mensaje.types";
import type { Preferencias } from "@/features/preferencias/preferencias.types";
import type { CuentaDemo } from "./cuentas";
import type { Tutor } from "@/features/tutores/tutor.types";
import type { Materia } from "@/features/catalogos/catalogo.types";
import type { Retiro } from "@/features/ingresos/ingresos.types";
import { DISPONIBILIDADES } from "./agenda";
import { MATERIAS, TUTORES } from "./datos";
import { CUENTAS } from "./cuentas";
import { reservasIniciales } from "./reservas-iniciales";

/**
 * Almacén en memoria de los datos que sí se modifican (agendas y reservas).
 *
 * Vive en `globalThis` a propósito: en desarrollo, Next recarga los módulos
 * en caliente, y sin esto cada guardado se perdería al editar un archivo.
 * Se reinicia al reiniciar el servidor, que es suficiente hasta que entre
 * PostgreSQL; el contrato de los repositorios no cambia cuando eso pase.
 */
interface Almacen {
  version: number;
  disponibilidades: Record<string, Disponibilidad>;
  reservas: Reserva[];
  resenas: Resena[];
  notificaciones: Notificacion[];
  solicitudes: SolicitudExpress[];
  materias: Materia[];
  tutores: Tutor[];
  cuentas: CuentaDemo[];
  /** Pares "estudianteId:tutorId". */
  favoritos: string[];
  preferencias: Preferencias[];
  conversaciones: Conversacion[];
  mensajes: Mensaje[];
  retiros: Retiro[];
  notasSesion: { reservaId: string; usuarioId: string; texto: string }[];
  recuperaciones: { token: string; usuarioId: string; venceEn: number }[];
  secuencia: number;
}

/**
 * Súbela cada vez que cambie la forma de `Almacen`.
 *
 * Sin esto, un almacén creado antes del cambio sobrevive a la recarga en
 * caliente con los campos nuevos en `undefined`, y el fallo aparece lejos:
 * un `filter` sobre algo que no existe, en otro archivo. Con la versión, el
 * almacén viejo se descarta y se vuelve a sembrar.
 */
const VERSION = 10;

declare global {
  var __almacenTutores: Almacen | undefined;
}

function sembrar(): Almacen {
  return {
    version: VERSION,
    disponibilidades: structuredClone(DISPONIBILIDADES),
    reservas: reservasIniciales(),
    resenas: [],
    notificaciones: [],
    solicitudes: [],
    materias: structuredClone(MATERIAS),
    tutores: structuredClone(TUTORES),
    cuentas: structuredClone(CUENTAS),
    favoritos: [],
    preferencias: [],
    conversaciones: [],
    mensajes: [],
    retiros: [],
    notasSesion: [],
    recuperaciones: [],
    secuencia: 1,
  };
}

const guardado = globalThis.__almacenTutores;

export const almacen: Almacen =
  guardado?.version === VERSION
    ? guardado
    : (globalThis.__almacenTutores = sembrar());

/** Identificadores legibles en la interfaz: R-0001, R-0002… */
export function siguienteId(prefijo: string): string {
  const numero = almacen.secuencia;
  almacen.secuencia += 1;
  return `${prefijo}-${String(numero).padStart(4, "0")}`;
}
