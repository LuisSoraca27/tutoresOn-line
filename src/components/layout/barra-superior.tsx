"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@heroui/react";
import { Logo } from "@/components/ui/logo";
import { IconoBuscar } from "@/components/ui/iconos";
import { MenuUsuario } from "@/components/layout/menu-usuario";
import { CampanaNotificaciones } from "@/components/layout/campana-notificaciones";
import { SelectorTema } from "@/components/layout/selector-tema";
import { useSesion } from "@/features/sesion/contexto-sesion";

const ENLACES_PUBLICOS = [
  { etiqueta: "Buscar tutores", href: "/buscar" },
  { etiqueta: "Cómo funciona", href: "/como-funciona" },
  { etiqueta: "Ser tutor", href: "/auth/registro/tutor" },
];

/**
 * Barra superior de toda la aplicación (F12.1).
 *
 * HeroUI v3 no trae un componente Navbar, así que la barra se compone
 * con Tailwind y los componentes que sí existen: Separator y poco más.
 *
 * Flota: el `<header>` es solo el hueco pegajoso —transparente, con el velo
 * de `.barra-flotante` detrás— y la isla de cristal va dentro, separada de
 * los bordes de la ventana. Al no ocupar todo el ancho, el contenido se ve
 * pasar por sus costados y el vidrio tiene algo que refractar; una barra
 * pegada al borde solo puede desenfocar lo que lleva justo debajo.
 */
export function BarraSuperior({ mostrarMenuLateral }: { mostrarMenuLateral?: React.ReactNode }) {
  const ruta = usePathname();
  const { usuario } = useSesion();

  return (
    <header className="barra-flotante sticky top-0 z-40 px-2.5 pt-2.5 pb-2 sm:px-5 sm:pt-4">
      <div className="vidrio vidrio-refractante barra-isla mx-auto flex h-14 w-full max-w-[1400px] items-center gap-2 rounded-[var(--vidrio-radio)] px-2.5 sm:gap-3 sm:px-4">
        {mostrarMenuLateral}
        <Logo />

        {!usuario ? (
          <nav aria-label="Navegación principal" className="ml-6 hidden items-center gap-1 lg:flex">
            {ENLACES_PUBLICOS.map((enlace) => {
              const activo = ruta === enlace.href;
              return (
                <Link
                  key={enlace.href}
                  href={enlace.href}
                  aria-current={activo ? "page" : undefined}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
                    activo
                      ? "bg-[var(--accent-soft)] text-[var(--accent-soft-foreground)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {enlace.etiqueta}
                </Link>
              );
            })}
          </nav>
        ) : null}

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          {/* Atajo a la búsqueda para quien no tiene menú lateral: en el móvil
              de una página pública esta es la única puerta a /buscar, porque
              la navegación de texto se esconde por debajo de lg. En un panel
              sobra: la misma entrada está en el cajón. */}
          {!mostrarMenuLateral ? (
            <Link
              href="/buscar"
              aria-label="Buscar tutores"
              className="flex size-9 items-center justify-center rounded-lg text-[var(--muted)] outline-none hover:bg-[var(--default-soft)] hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] lg:hidden"
            >
              <IconoBuscar />
            </Link>
          ) : null}

          {usuario ? <CampanaNotificaciones /> : null}

          <SelectorTema />
          {/* El separador es decoración: lo primero que sobra cuando la fila
              va apretada. */}
          <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />
          <MenuUsuario />
        </div>
      </div>
    </header>
  );
}
