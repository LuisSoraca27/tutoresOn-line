import type { EstadoReserva, Reserva } from "@/features/reservas/reserva.types";
import { aIsoFecha } from "@/features/disponibilidad/calcular-turnos";

/**
 * Reservas de arranque.
 *
 * Se generan relativas al día de hoy, no con fechas fijas: si estuvieran
 * escritas a mano, en dos semanas todo el historial aparecería en el futuro
 * y las pantallas de "próximas" y "pasadas" mostrarían lo contrario de lo
 * que dicen. Con esto el proyecto se puede abrir cualquier día y verse bien.
 */

interface Plantilla {
  dias: number;
  hora: string;
  duracionMinutos: number;
  tutorId: string;
  estudianteId: string;
  materiaId: string;
  nivelId: string;
  modalidad: "virtual" | "presencial";
  precio: number;
  estado: EstadoReserva;
  lugar?: string;
  notaEstudiante?: string;
  motivoRechazo?: string;
}

const PLANTILLAS: Plantilla[] = [
  // --- Solicitudes que esperan respuesta de Mariana (t-001), la tutora demo.
  {
    dias: 3,
    hora: "09:00",
    duracionMinutos: 90,
    tutorId: "t-001",
    estudianteId: "e-002",
    materiaId: "calculo",
    nivelId: "bachillerato",
    modalidad: "virtual",
    precio: 78000,
    estado: "pendiente",
    notaEstudiante: "Tengo parcial de derivadas el lunes y me trabo con la regla de la cadena.",
  },
  {
    dias: 5,
    hora: "10:00",
    duracionMinutos: 60,
    tutorId: "t-001",
    estudianteId: "e-003",
    materiaId: "estadistica",
    nivelId: "universitario",
    modalidad: "presencial",
    precio: 52000,
    estado: "pendiente",
    lugar: "Biblioteca EPM, Medellín",
    notaEstudiante: "Necesito repasar pruebas de hipótesis.",
  },
  {
    dias: 8,
    hora: "15:00",
    duracionMinutos: 60,
    tutorId: "t-001",
    estudianteId: "e-005",
    materiaId: "estadistica",
    nivelId: "posgrado",
    modalidad: "virtual",
    precio: 52000,
    estado: "pendiente",
  },

  // --- Agenda ya confirmada de Mariana.
  {
    dias: 2,
    hora: "14:00",
    duracionMinutos: 60,
    tutorId: "t-001",
    estudianteId: "e-004",
    materiaId: "calculo",
    nivelId: "bachillerato",
    modalidad: "virtual",
    precio: 52000,
    estado: "aceptada",
  },
  {
    dias: 6,
    hora: "08:00",
    duracionMinutos: 120,
    tutorId: "t-001",
    estudianteId: "e-003",
    materiaId: "calculo",
    nivelId: "universitario",
    modalidad: "virtual",
    precio: 104000,
    estado: "aceptada",
  },

  // --- Historial de Mariana, para que los ingresos y el historial no salgan vacíos.
  {
    dias: -4,
    hora: "09:00",
    duracionMinutos: 60,
    tutorId: "t-001",
    estudianteId: "e-002",
    materiaId: "calculo",
    nivelId: "bachillerato",
    modalidad: "virtual",
    precio: 52000,
    estado: "finalizada",
  },
  {
    dias: -11,
    hora: "16:00",
    duracionMinutos: 90,
    tutorId: "t-001",
    estudianteId: "e-004",
    materiaId: "estadistica",
    nivelId: "universitario",
    modalidad: "virtual",
    precio: 78000,
    estado: "finalizada",
  },

  // --- Sara con Mariana: las dos identidades de demostración comparten una
  //     sesión pasada, para poder recorrer reseña y respuesta de punta a punta.
  {
    dias: -9,
    hora: "10:15",
    duracionMinutos: 60,
    tutorId: "t-001",
    estudianteId: "e-001",
    materiaId: "calculo",
    nivelId: "universitario",
    modalidad: "virtual",
    precio: 52000,
    estado: "finalizada",
  },

  // --- Lo que ve Sara (e-001), la estudiante demo.
  {
    dias: 4,
    hora: "18:00",
    duracionMinutos: 60,
    tutorId: "t-002",
    estudianteId: "e-001",
    materiaId: "programacion",
    nivelId: "universitario",
    modalidad: "virtual",
    precio: 60000,
    estado: "aceptada",
    notaEstudiante: "Quiero entender bien recursión antes del taller.",
  },
  {
    dias: 9,
    hora: "07:00",
    duracionMinutos: 60,
    tutorId: "t-003",
    estudianteId: "e-001",
    materiaId: "ingles",
    nivelId: "universitario",
    modalidad: "virtual",
    precio: 40000,
    estado: "pendiente",
  },
  {
    dias: -6,
    hora: "18:00",
    duracionMinutos: 60,
    tutorId: "t-002",
    estudianteId: "e-001",
    materiaId: "programacion",
    nivelId: "universitario",
    modalidad: "virtual",
    precio: 60000,
    estado: "finalizada",
  },
  {
    dias: -13,
    hora: "10:00",
    duracionMinutos: 60,
    tutorId: "t-005",
    estudianteId: "e-001",
    materiaId: "quimica",
    nivelId: "universitario",
    modalidad: "virtual",
    precio: 42000,
    estado: "cancelada",
  },
  {
    dias: -18,
    hora: "11:00",
    duracionMinutos: 60,
    tutorId: "t-004",
    estudianteId: "e-001",
    materiaId: "fisica",
    nivelId: "universitario",
    modalidad: "presencial",
    precio: 45000,
    estado: "rechazada",
    lugar: "Universidad Nacional, Bogotá",
    motivoRechazo: "Ese día no alcanzo a llegar a la sede.",
  },
];

/** Suma (o resta) días a hoy y devuelve "AAAA-MM-DD". */
function fechaRelativa(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return aIsoFecha(fecha);
}

function finDe(inicio: string, duracionMinutos: number): string {
  const [fecha, hora] = inicio.split("T");
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + duracionMinutos;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${fecha}T${hh}:${mm}`;
}

export function reservasIniciales(): Reserva[] {
  return PLANTILLAS.map((plantilla, indice) => {
    const inicio = `${fechaRelativa(plantilla.dias)}T${plantilla.hora}`;

    return {
      id: `R-${String(900 + indice).padStart(4, "0")}`,
      tutorId: plantilla.tutorId,
      estudianteId: plantilla.estudianteId,
      materiaId: plantilla.materiaId,
      nivelId: plantilla.nivelId as Reserva["nivelId"],
      modalidad: plantilla.modalidad,
      inicio,
      fin: finDe(inicio, plantilla.duracionMinutos),
      duracionMinutos: plantilla.duracionMinutos,
      precio: plantilla.precio,
      estado: plantilla.estado,
      lugar: plantilla.lugar,
      notaEstudiante: plantilla.notaEstudiante,
      motivoRechazo: plantilla.motivoRechazo,
      creadaEn: new Date().toISOString(),
    };
  });
}
