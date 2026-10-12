"use client";

import { usePathname, useRouter } from "next/navigation";
import { Label, ListBox, Select, type Key } from "@heroui/react";
import type { FiltrosTutor, OrdenTutor } from "@/features/tutores";
import { aQuery, ETIQUETA_ORDEN } from "@/features/tutores/filtros-url";

/** Ordenamiento de resultados (F2.10). */
export function SelectorOrden({ filtros }: { filtros: FiltrosTutor }) {
  const router = useRouter();
  const ruta = usePathname();

  const opciones = Object.entries(ETIQUETA_ORDEN) as [OrdenTutor, string][];

  return (
    <Select
      className="w-56"
      value={filtros.orden ?? "relevancia"}
      onChange={(valor: Key | null) =>
        router.replace(
          `${ruta}${aQuery({ ...filtros, orden: (valor as OrdenTutor) ?? "relevancia", pagina: 1 })}`,
          { scroll: false },
        )
      }
    >
      <Label className="sr-only">Ordenar resultados</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {opciones.map(([clave, etiqueta]) => (
            <ListBox.Item key={clave} id={clave} textValue={etiqueta}>
              {etiqueta}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
