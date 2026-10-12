"use client";

import { Drawer } from "@heroui/react";
import { BarraSuperior } from "@/components/layout/barra-superior";
import { MenuLateral } from "@/components/layout/menu-lateral";
import { IconoMenu } from "@/components/ui/iconos";
import type { Rol } from "@/config/sitio";

/**
 * Marco compartido por los paneles de estudiante y tutor:
 * barra flotante + menú lateral en un panel de cristal en escritorio y en
 * cajón en móvil.
 *
 * No comprueba el rol: para cuando este componente se pinta ya pasaron el
 * `proxy` y el `exigirUsuario()` del layout del panel. Un marco que
 * decidiera de nuevo quién entra sería una tercera regla que mantener
 * sincronizada con las otras dos.
 */
export function MarcoPanel({ rol, children }: { rol: Rol; children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <BarraSuperior
        mostrarMenuLateral={
          <Drawer>
            <Drawer.Trigger
              aria-label="Abrir menú de secciones"
              className="-ml-1 flex size-9 items-center justify-center rounded-lg text-[var(--muted)] outline-none hover:bg-[var(--default-soft)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] lg:hidden"
            >
              <IconoMenu />
            </Drawer.Trigger>

            <Drawer.Content placement="left">
              <Drawer.Dialog className="w-72">
                {({ close }) => (
                  <>
                    <Drawer.Header>
                      <Drawer.Heading>Mi panel</Drawer.Heading>
                    </Drawer.Header>
                    <Drawer.Body className="px-2">
                      <MenuLateral rol={rol} onNavegar={close} />
                    </Drawer.Body>
                  </>
                )}
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer>
        }
      />

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-3 pt-2 sm:px-5">
        {/* El panel se cuelga de la isla: `top` es el alto de la barra más el
            aire que la separa de la ventana, para que los dos cristales queden
            alineados y separados por el mismo hueco. */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="vidrio vidrio-refractante panel-lateral sticky top-[5.25rem] max-h-[calc(100dvh-6.5rem)] overflow-y-auto overscroll-contain rounded-[var(--vidrio-radio)] px-2">
            <MenuLateral rol={rol} />
          </div>
        </aside>

        <main className="min-w-0 flex-1 py-6">{children}</main>
      </div>
    </div>
  );
}
