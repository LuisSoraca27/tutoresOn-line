"use client";

import { Button, Chip, Drawer, useOverlayState } from "@heroui/react";
import { PanelFiltros } from "@/components/tutores/panel-filtros";
import type { Ciudad, Materia, Nivel } from "@/features/catalogos";
import type { FiltrosTutor } from "@/features/tutores";
import { filtrosAplicados } from "@/features/tutores/filtros-url";

/**
 * En móvil los filtros viven en un cajón (F2.9); en escritorio la misma
 * `PanelFiltros` se muestra fija en la columna izquierda. Un solo componente
 * de filtros, dos presentaciones.
 */
export function CajonFiltros({
  filtros,
  materias,
  niveles,
  ciudades,
}: {
  filtros: FiltrosTutor;
  materias: Materia[];
  niveles: Nivel[];
  ciudades: Ciudad[];
}) {
  const estado = useOverlayState();
  const activos = filtrosAplicados(filtros);

  return (
    <Drawer state={estado}>
      <Button variant="outline" className="lg:hidden" onPress={estado.open}>
        Filtros
        {activos > 0 ? (
          <Chip size="sm" color="accent" variant="soft">
            {activos}
          </Chip>
        ) : null}
      </Button>

      <Drawer.Content placement="left">
        <Drawer.Dialog className="w-[85vw] max-w-sm">
          <Drawer.Header>
            <Drawer.Heading>Filtrar tutores</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body>
            <PanelFiltros
              filtros={filtros}
              materias={materias}
              niveles={niveles}
              ciudades={ciudades}
              onAplicar={estado.close}
              mostrarTitulo={false}
            />
          </Drawer.Body>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer>
  );
}
