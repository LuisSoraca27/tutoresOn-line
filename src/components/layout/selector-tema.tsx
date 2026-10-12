"use client";

import { Button, Tooltip, useIsHydrated, useTheme } from "@heroui/react";
import { IconoLuna, IconoSol } from "@/components/ui/iconos";

/**
 * Alterna claro y oscuro. `useTheme` de HeroUI escribe la clase en <html>
 * y guarda la preferencia en localStorage bajo "heroui-theme"; el guion de
 * `layout.tsx` la aplica antes de pintar para que no haya parpadeo.
 *
 * El ícono no se puede pintar en el servidor: `useTheme` lee localStorage,
 * así que el servidor y el cliente llegarían a resultados distintos y la
 * hidratación fallaría. `useIsHydrated` mantiene ambos lados iguales y deja
 * el hueco reservado para que la barra no salte.
 */
export function SelectorTema() {
  const hidratado = useIsHydrated();
  const { resolvedTheme, setTheme } = useTheme();

  const oscuro = resolvedTheme === "dark";

  // La etiqueta también depende del tema, así que antes de hidratar tiene que
  // ser neutra: si no, el servidor dice una cosa, el cliente otra y React
  // aborta la hidratación de todo el árbol.
  const etiqueta = !hidratado
    ? "Cambiar el tema"
    : oscuro
      ? "Cambiar a tema claro"
      : "Cambiar a tema oscuro";

  return (
    <Tooltip>
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        aria-label={etiqueta}
        onPress={() => setTheme(oscuro ? "light" : "dark")}
      >
        {hidratado ? oscuro ? <IconoSol /> : <IconoLuna /> : <span className="size-5" />}
      </Button>
      <Tooltip.Content>{etiqueta}</Tooltip.Content>
    </Tooltip>
  );
}
