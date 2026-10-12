import type { Rol } from "./sitio";

/** Clave del ícono; `components/ui/iconos.tsx` la traduce a un SVG. */
export type NombreIcono =
  | "tablero"
  | "buscar"
  | "calendario"
  | "reloj"
  | "bandeja"
  | "libro"
  | "mapa"
  | "estrella"
  | "dinero"
  | "historial"
  | "chat"
  | "campana"
  | "persona"
  | "corazon"
  | "chispa";

export interface ItemNavegacion {
  etiqueta: string;
  href: string;
  icono: NombreIcono;
}

export interface GrupoNavegacion {
  titulo: string;
  items: ItemNavegacion[];
}

/**
 * Menú lateral por rol. Es un dato, no código: agregar una pantalla
 * es agregar una línea aquí, sin tocar el componente del menú
 * (principio O de SOLID: abierto a extensión, cerrado a modificación).
 */
export const NAVEGACION: Record<Exclude<Rol, "visitante">, GrupoNavegacion[]> = {
  estudiante: [
    {
      titulo: "Mis tutorías",
      items: [
        { etiqueta: "Inicio", href: "/estudiante", icono: "tablero" },
        { etiqueta: "Mis reservas", href: "/estudiante/reservas", icono: "calendario" },
        { etiqueta: "Buscar tutor", href: "/buscar", icono: "buscar" },
      ],
    },
    {
      titulo: "Al instante",
      items: [
        { etiqueta: "Tutor ahora", href: "/estudiante/ahora", icono: "reloj" },
        { etiqueta: "Asistente IA", href: "/estudiante/asistente", icono: "chispa" },
      ],
    },
    {
      titulo: "Mi cuenta",
      items: [
        { etiqueta: "Favoritos", href: "/estudiante/favoritos", icono: "corazon" },
        { etiqueta: "Mensajes", href: "/estudiante/mensajes", icono: "chat" },
        { etiqueta: "Mi perfil", href: "/estudiante/perfil", icono: "persona" },
      ],
    },
  ],

  tutor: [
    {
      titulo: "Mi trabajo",
      items: [
        { etiqueta: "Inicio", href: "/tutor", icono: "tablero" },
        { etiqueta: "Solicitudes", href: "/tutor/solicitudes", icono: "bandeja" },
        { etiqueta: "Agenda", href: "/tutor/agenda", icono: "calendario" },
        { etiqueta: "Disponibilidad", href: "/tutor/disponibilidad", icono: "reloj" },
      ],
    },
    {
      titulo: "Mi oferta",
      items: [
        { etiqueta: "Materias y tarifas", href: "/tutor/materias", icono: "libro" },
        { etiqueta: "Cobertura", href: "/tutor/cobertura", icono: "mapa" },
        { etiqueta: "Mi perfil público", href: "/tutor/perfil", icono: "persona" },
      ],
    },
    {
      titulo: "Resultados",
      items: [
        { etiqueta: "Reseñas", href: "/tutor/resenas", icono: "estrella" },
        { etiqueta: "Ingresos", href: "/tutor/ingresos", icono: "dinero" },
        { etiqueta: "Historial", href: "/tutor/historial", icono: "historial" },
        { etiqueta: "Mensajes", href: "/tutor/mensajes", icono: "chat" },
      ],
    },
  ],
};
