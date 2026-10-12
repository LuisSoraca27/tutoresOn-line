"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVEGACION, type GrupoNavegacion } from "@/config/navegacion";
import { Icono } from "@/components/ui/iconos";
import type { Rol } from "@/config/sitio";

/**
 * Menú lateral por rol (F12.2). Se dibuja a partir de `config/navegacion.ts`:
 * agregar una pantalla nueva no obliga a tocar este componente.
 *
 * Solo la lista: el cristal que la sostiene lo pone quien la coloca —el panel
 * flotante en escritorio, el cajón en móvil—. Si el menú trajera su propio
 * fondo, en el cajón habría dos vidrios encima del otro y el desenfoque se
 * duplicaría.
 */
export function MenuLateral({ rol, onNavegar }: { rol: Rol; onNavegar?: () => void }) {
  const ruta = usePathname();

  if (rol === "visitante") return null;
  const grupos: GrupoNavegacion[] = NAVEGACION[rol];

  return (
    <nav aria-label="Secciones de mi panel" className="flex flex-col gap-5 py-4">
      {grupos.map((grupo) => (
        <div key={grupo.titulo} className="flex flex-col gap-1">
          <h2 className="px-3 pb-1.5 text-[11px] font-medium tracking-[0.12em] text-[var(--muted)] uppercase">
            {grupo.titulo}
          </h2>

          {grupo.items.map((item) => {
            const activo = ruta === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavegar}
                aria-current={activo ? "page" : undefined}
                className={`item-menu group flex items-center gap-2.5 rounded-xl py-2 pr-3 pl-3.5 text-sm transition-[background-color,box-shadow,color] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
                  activo
                    ? "item-menu--activo font-medium text-[var(--accent-soft-foreground)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icono nombre={item.icono} className="size-[18px] shrink-0" />
                <span className="truncate">{item.etiqueta}</span>

              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
