import type { SVGProps } from "react";
import type { NombreIcono } from "@/config/navegacion";

type Props = SVGProps<SVGSVGElement>;

/**
 * Set propio de íconos: son trazos simples sobre una rejilla de 24,
 * así el proyecto no arrastra una librería entera por veinte símbolos.
 */
function Base({ children, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={20}
      height={20}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconoTablero = (p: Props) => (
  <Base {...p}>
    <rect x="3" y="3" width="7" height="8" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="11" width="7" height="10" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </Base>
);

export const IconoBuscar = (p: Props) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Base>
);

export const IconoCalendario = (p: Props) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Base>
);

export const IconoReloj = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.2 2" />
  </Base>
);

export const IconoBandeja = (p: Props) => (
  <Base {...p}>
    <path d="M3 13h5l1.6 2.6h4.8L16 13h5" />
    <path d="M5 5h14l2 8v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Z" />
  </Base>
);

export const IconoLibro = (p: Props) => (
  <Base {...p}>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5Z" />
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v4H6.5A2.5 2.5 0 0 1 4 20.5Z" />
  </Base>
);

export const IconoMapa = (p: Props) => (
  <Base {...p}>
    <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </Base>
);

export const IconoEstrella = (p: Props) => (
  <Base {...p}>
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 9.7l5.9-.8Z" />
  </Base>
);

export const IconoDinero = (p: Props) => (
  <Base {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.8" />
    <path d="M6 12h.01M18 12h.01" />
  </Base>
);

export const IconoHistorial = (p: Props) => (
  <Base {...p}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
    <path d="M3 4v4h4" />
    <path d="M12 8v4.3l3 1.7" />
  </Base>
);

export const IconoChat = (p: Props) => (
  <Base {...p}>
    <path d="M20 15a2 2 0 0 1-2 2H8l-4 3.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
  </Base>
);

export const IconoCampana = (p: Props) => (
  <Base {...p}>
    <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Z" />
    <path d="M10 18a2 2 0 0 0 4 0" />
  </Base>
);

export const IconoPersona = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="3.8" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </Base>
);

export const IconoCorazon = (p: Props) => (
  <Base {...p}>
    <path d="M12 20s-7.5-4.6-7.5-9.6a4.4 4.4 0 0 1 7.5-3 4.4 4.4 0 0 1 7.5 3c0 5-7.5 9.6-7.5 9.6Z" />
  </Base>
);

export const IconoChispa = (p: Props) => (
  <Base {...p}>
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9Z" />
    <path d="M18.5 4v3M20 5.5h-3" />
  </Base>
);

export const IconoMenu = (p: Props) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);

export const IconoSol = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
  </Base>
);

export const IconoLuna = (p: Props) => (
  <Base {...p}>
    <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2Z" />
  </Base>
);

export const IconoVerificado = (p: Props) => (
  <Base {...p}>
    <path d="m12 2.8 2.3 1.7 2.8-.2.9 2.7 2.4 1.5-1 2.7 1 2.7-2.4 1.5-.9 2.7-2.8-.2L12 21.2l-2.3-1.7-2.8.2-.9-2.7-2.4-1.5 1-2.7-1-2.7 2.4-1.5.9-2.7 2.8.2Z" />
    <path d="m9.4 12 1.9 1.9 3.5-3.7" />
  </Base>
);

export const IconoVideo = (p: Props) => (
  <Base {...p}>
    <rect x="2.5" y="6" width="12.5" height="12" rx="2.5" />
    <path d="m15 11 6.5-3.5v9L15 13Z" />
  </Base>
);

export const IconoSalir = (p: Props) => (
  <Base {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 8 6 12l4 4M6 12h9" />
  </Base>
);

export const IconoOjo = (p: Props) => (
  <Base {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

export const IconoOjoTachado = (p: Props) => (
  <Base {...p}>
    <path d="M9.9 5.8A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.8" />
    <path d="M6.3 7.9A17 17 0 0 0 2.5 12S6 18.5 12 18.5c1.5 0 2.8-.4 4-1" />
    <path d="m10 10a2.8 2.8 0 0 0 4 4" />
    <path d="m4 4 16 16" />
  </Base>
);

const MAPA_ICONOS: Record<NombreIcono, (p: Props) => React.ReactElement> = {
  tablero: IconoTablero,
  buscar: IconoBuscar,
  calendario: IconoCalendario,
  reloj: IconoReloj,
  bandeja: IconoBandeja,
  libro: IconoLibro,
  mapa: IconoMapa,
  estrella: IconoEstrella,
  dinero: IconoDinero,
  historial: IconoHistorial,
  chat: IconoChat,
  campana: IconoCampana,
  persona: IconoPersona,
  corazon: IconoCorazon,
  chispa: IconoChispa,
};

/** Resuelve un ícono a partir de la clave usada en `config/navegacion.ts`. */
export function Icono({ nombre, ...props }: Props & { nombre: NombreIcono }) {
  const Componente = MAPA_ICONOS[nombre];
  return <Componente {...props} />;
}
