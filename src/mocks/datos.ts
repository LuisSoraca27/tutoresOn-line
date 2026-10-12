import type { Ciudad, Materia, Nivel } from "@/features/catalogos/catalogo.types";
import type { Tutor } from "@/features/tutores/tutor.types";

export const NIVELES: Nivel[] = [
  { id: "primaria", nombre: "Primaria" },
  { id: "bachillerato", nombre: "Bachillerato" },
  { id: "tecnico", nombre: "Técnico y tecnólogo" },
  { id: "universitario", nombre: "Universitario" },
  { id: "posgrado", nombre: "Posgrado" },
];

export const MATERIAS: Materia[] = [
  { id: "calculo", nombre: "Cálculo", area: "Matemáticas" },
  { id: "algebra", nombre: "Álgebra", area: "Matemáticas" },
  { id: "estadistica", nombre: "Estadística", area: "Matemáticas" },
  { id: "fisica", nombre: "Física", area: "Ciencias" },
  { id: "quimica", nombre: "Química", area: "Ciencias" },
  { id: "biologia", nombre: "Biología", area: "Ciencias" },
  { id: "programacion", nombre: "Programación", area: "Tecnología" },
  { id: "bases-datos", nombre: "Bases de datos", area: "Tecnología" },
  { id: "ingles", nombre: "Inglés", area: "Idiomas" },
  { id: "frances", nombre: "Francés", area: "Idiomas" },
  { id: "lenguaje", nombre: "Lengua castellana", area: "Humanidades" },
  { id: "historia", nombre: "Historia", area: "Humanidades" },
  { id: "contabilidad", nombre: "Contabilidad", area: "Economía" },
];

export const CIUDADES: Ciudad[] = [
  { id: "bogota", nombre: "Bogotá", departamento: "Cundinamarca" },
  { id: "medellin", nombre: "Medellín", departamento: "Antioquia" },
  { id: "cali", nombre: "Cali", departamento: "Valle del Cauca" },
  { id: "barranquilla", nombre: "Barranquilla", departamento: "Atlántico" },
  { id: "bucaramanga", nombre: "Bucaramanga", departamento: "Santander" },
  { id: "cartagena", nombre: "Cartagena", departamento: "Bolívar" },
];

/**
 * Reparte un total de reseñas en una distribución creíble para el promedio.
 *
 * Las proporciones suman 1 y el último escalón absorbe el residuo del
 * redondeo: así la suma de los cinco escalones es siempre `total` y los
 * porcentajes que muestra la interfaz suman 100 %.
 */
function reputacion(promedio: number, total: number): Tutor["reputacion"] {
  const proporciones =
    promedio >= 4.95
      ? [1, 0, 0, 0]
      : promedio >= 4.8
        ? [0.88, 0.08, 0.03, 0.01]
        : promedio >= 4.5
          ? [0.72, 0.18, 0.06, 0.03]
          : [0.55, 0.26, 0.11, 0.05];

  const [cinco, cuatro, tres, dos] = proporciones.map((parte) => Math.round(total * parte));
  const uno = Math.max(0, total - cinco - cuatro - tres - dos);

  return {
    promedio,
    total,
    distribucion: { "5": cinco, "4": cuatro, "3": tres, "2": dos, "1": uno },
  };
}

export const TUTORES: Tutor[] = [
  {
    id: "t-001",
    nombre: "Mariana Restrepo",
    titulo: "Matemática, MSc. en Estadística",
    bio: "Acompaño a estudiantes universitarios en cálculo y estadística. Trabajo con ejercicios de parciales reales y explico cada paso hasta que el método quede claro.",
    avatarUrl: null,
    modalidad: "ambas",
    ciudadId: "medellin",
    radioKm: 12,
    materias: [
      { materiaId: "calculo", nivelIds: ["bachillerato", "universitario"], precioHora: 52000 },
      { materiaId: "estadistica", nivelIds: ["universitario", "posgrado"], precioHora: 60000 },
    ],
    precioDesde: 52000,
    reputacion: reputacion(4.9, 187),
    sesionesCompletadas: 412,
    verificado: true,
    respondeRapido: true,
    disponibleAhora: true,
    idiomas: ["Español", "Inglés"],
  },
  {
    id: "t-002",
    nombre: "Andrés Quintero",
    titulo: "Ingeniero de sistemas",
    bio: "Programación desde cero y bases de datos. Si estás atascado con un proyecto de la universidad, lo revisamos juntos línea por línea.",
    avatarUrl: null,
    modalidad: "virtual",
    ciudadId: null,
    radioKm: null,
    materias: [
      {
        materiaId: "programacion",
        nivelIds: ["bachillerato", "tecnico", "universitario"],
        precioHora: 45000,
      },
      { materiaId: "bases-datos", nivelIds: ["tecnico", "universitario"], precioHora: 48000 },
    ],
    precioDesde: 45000,
    reputacion: reputacion(4.7, 94),
    sesionesCompletadas: 203,
    verificado: true,
    respondeRapido: true,
    disponibleAhora: false,
    idiomas: ["Español"],
  },
  {
    id: "t-003",
    nombre: "Laura Cifuentes",
    titulo: "Licenciada en Lenguas Modernas",
    bio: "Inglés conversacional y preparación para exámenes internacionales. Las clases son en inglés desde el primer minuto, al ritmo que necesites.",
    avatarUrl: null,
    modalidad: "virtual",
    ciudadId: null,
    radioKm: null,
    materias: [
      {
        materiaId: "ingles",
        nivelIds: ["primaria", "bachillerato", "universitario", "posgrado"],
        precioHora: 40000,
      },
      { materiaId: "frances", nivelIds: ["bachillerato", "universitario"], precioHora: 44000 },
    ],
    precioDesde: 40000,
    reputacion: reputacion(5, 231),
    sesionesCompletadas: 588,
    verificado: true,
    respondeRapido: true,
    disponibleAhora: true,
    idiomas: ["Español", "Inglés", "Francés"],
  },
  {
    id: "t-004",
    nombre: "Julián Ospina",
    titulo: "Físico",
    bio: "Física para bachillerato y primeros semestres. Prefiero empezar por el fenómeno y llegar a la fórmula, no al revés.",
    avatarUrl: null,
    modalidad: "presencial",
    ciudadId: "bogota",
    radioKm: 8,
    materias: [
      { materiaId: "fisica", nivelIds: ["bachillerato", "universitario"], precioHora: 50000 },
      { materiaId: "algebra", nivelIds: ["bachillerato"], precioHora: 38000 },
    ],
    precioDesde: 38000,
    reputacion: reputacion(4.6, 61),
    sesionesCompletadas: 128,
    verificado: true,
    respondeRapido: false,
    disponibleAhora: false,
    idiomas: ["Español"],
  },
  {
    id: "t-005",
    nombre: "Daniela Moreno",
    titulo: "Química farmacéutica",
    bio: "Química general y orgánica. Armamos un plan por temas y llegamos al parcial sabiendo exactamente qué falta repasar.",
    avatarUrl: null,
    modalidad: "ambas",
    ciudadId: "cali",
    radioKm: 15,
    materias: [
      { materiaId: "quimica", nivelIds: ["bachillerato", "universitario"], precioHora: 47000 },
      { materiaId: "biologia", nivelIds: ["bachillerato"], precioHora: 42000 },
    ],
    precioDesde: 42000,
    reputacion: reputacion(4.8, 143),
    sesionesCompletadas: 297,
    verificado: true,
    respondeRapido: true,
    disponibleAhora: true,
    idiomas: ["Español"],
  },
  {
    id: "t-006",
    nombre: "Camilo Navarro",
    titulo: "Contador público",
    bio: "Contabilidad y costos para técnicos y universitarios. Trabajamos sobre tus propios talleres, no sobre ejemplos genéricos.",
    avatarUrl: null,
    modalidad: "virtual",
    ciudadId: null,
    radioKm: null,
    materias: [{ materiaId: "contabilidad", nivelIds: ["tecnico", "universitario"], precioHora: 43000 }],
    precioDesde: 43000,
    reputacion: reputacion(4.4, 38),
    sesionesCompletadas: 71,
    verificado: false,
    respondeRapido: false,
    disponibleAhora: false,
    idiomas: ["Español"],
  },
  {
    id: "t-007",
    nombre: "Valentina Ríos",
    titulo: "Licenciada en Matemáticas",
    bio: "Refuerzo de primaria y bachillerato. Mucha paciencia, material visual y tareas cortas para no perder el hilo entre sesiones.",
    avatarUrl: null,
    modalidad: "ambas",
    ciudadId: "barranquilla",
    radioKm: 10,
    materias: [
      { materiaId: "algebra", nivelIds: ["primaria", "bachillerato"], precioHora: 35000 },
      { materiaId: "calculo", nivelIds: ["bachillerato"], precioHora: 40000 },
    ],
    precioDesde: 35000,
    reputacion: reputacion(4.9, 112),
    sesionesCompletadas: 244,
    verificado: true,
    respondeRapido: true,
    disponibleAhora: false,
    idiomas: ["Español"],
  },
  {
    id: "t-008",
    nombre: "Sebastián Lozano",
    titulo: "Historiador",
    bio: "Historia y lengua castellana. Preparación de ensayos, comprensión de lectura y pruebas Saber 11.",
    avatarUrl: null,
    modalidad: "virtual",
    ciudadId: null,
    radioKm: null,
    materias: [
      { materiaId: "historia", nivelIds: ["bachillerato", "universitario"], precioHora: 36000 },
      { materiaId: "lenguaje", nivelIds: ["primaria", "bachillerato"], precioHora: 34000 },
    ],
    precioDesde: 34000,
    reputacion: reputacion(4.5, 47),
    sesionesCompletadas: 96,
    verificado: false,
    respondeRapido: true,
    disponibleAhora: true,
    idiomas: ["Español"],
  },
  {
    id: "t-009",
    nombre: "Paula Guerrero",
    titulo: "Ingeniera de datos",
    bio: "SQL, modelado de datos y proyectos con PostgreSQL. Ideal si vas a sustentar un proyecto y necesitas que el modelo quede bien.",
    avatarUrl: null,
    modalidad: "virtual",
    ciudadId: null,
    radioKm: null,
    materias: [
      {
        materiaId: "bases-datos",
        nivelIds: ["tecnico", "universitario", "posgrado"],
        precioHora: 58000,
      },
      { materiaId: "programacion", nivelIds: ["universitario"], precioHora: 55000 },
    ],
    precioDesde: 55000,
    reputacion: reputacion(4.8, 76),
    sesionesCompletadas: 154,
    verificado: true,
    respondeRapido: true,
    disponibleAhora: true,
    idiomas: ["Español", "Inglés"],
  },
  {
    id: "t-010",
    nombre: "Ricardo Peña",
    titulo: "Biólogo, MSc.",
    bio: "Biología celular y genética para universitarios. Explico con esquemas y casos, y dejo un resumen escrito de cada sesión.",
    avatarUrl: null,
    modalidad: "presencial",
    ciudadId: "bucaramanga",
    radioKm: 6,
    materias: [{ materiaId: "biologia", nivelIds: ["universitario", "posgrado"], precioHora: 54000 }],
    precioDesde: 54000,
    reputacion: reputacion(4.7, 55),
    sesionesCompletadas: 118,
    verificado: true,
    respondeRapido: false,
    disponibleAhora: false,
    idiomas: ["Español"],
  },
];
