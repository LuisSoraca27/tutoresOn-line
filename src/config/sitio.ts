export const sitio = {
  nombre: "TutoresOn-Line",
  descripcion:
    "Encuentra tutores calificados por materia, nivel y ciudad. Reserva en línea o presencial y toma tu clase el mismo día.",
  contacto: "hola@tutoresonline.co",
} as const;

/** Los tres roles del sistema. El visitante no tiene sesión iniciada. */
export type Rol = "visitante" | "estudiante" | "tutor";

export const ETIQUETA_ROL: Record<Rol, string> = {
  visitante: "Visitante",
  estudiante: "Estudiante",
  tutor: "Tutor",
};

/** A dónde va cada rol al iniciar sesión. */
export const INICIO_POR_ROL: Record<Rol, string> = {
  visitante: "/",
  estudiante: "/estudiante",
  tutor: "/tutor",
};
