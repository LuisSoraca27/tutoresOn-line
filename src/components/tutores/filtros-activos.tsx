"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button, Tag, TagGroup } from "@heroui/react";
import type { Ciudad, Materia, Nivel } from "@/features/catalogos";
import type { FiltrosTutor } from "@/features/tutores";
import { aQuery, ETIQUETA_MODALIDAD } from "@/features/tutores/filtros-url";
import { calificacion, precio } from "@/lib/formato";

/** Cada etiqueta sabe qué parte del filtro borra al quitarse. */
type Etiqueta = { id: string; texto: string; limpiar: Partial<FiltrosTutor> };

/**
 * Filtros aplicados, visibles y removibles uno a uno (F2.8).
 *
 * En HeroUI v3 el Chip no se puede cerrar: para esto existen TagGroup y Tag,
 * que además traen el manejo de teclado (Backspace elimina el foco actual).
 */
export function FiltrosActivos({
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
  const router = useRouter();
  const ruta = usePathname();

  const etiquetas: Etiqueta[] = [];

  if (filtros.q) {
    etiquetas.push({ id: "q", texto: `“${filtros.q}”`, limpiar: { q: undefined } });
  }

  if (filtros.materiaId) {
    const materia = materias.find((m) => m.id === filtros.materiaId);
    etiquetas.push({
      id: "materia",
      texto: materia?.nombre ?? filtros.materiaId,
      limpiar: { materiaId: undefined },
    });
  }

  if (filtros.nivelId) {
    const nivel = niveles.find((n) => n.id === filtros.nivelId);
    etiquetas.push({
      id: "nivel",
      texto: nivel?.nombre ?? filtros.nivelId,
      limpiar: { nivelId: undefined },
    });
  }

  if (filtros.modalidad && filtros.modalidad !== "ambas") {
    etiquetas.push({
      id: "modalidad",
      texto: ETIQUETA_MODALIDAD[filtros.modalidad],
      limpiar: { modalidad: undefined, ciudadId: undefined },
    });
  }

  if (filtros.ciudadId) {
    const ciudad = ciudades.find((c) => c.id === filtros.ciudadId);
    etiquetas.push({
      id: "ciudad",
      texto: ciudad?.nombre ?? filtros.ciudadId,
      limpiar: { ciudadId: undefined },
    });
  }

  if (filtros.precioMax !== undefined) {
    etiquetas.push({
      id: "precio",
      texto: `Hasta ${precio(filtros.precioMax)}`,
      limpiar: { precioMax: undefined },
    });
  }

  if (filtros.calificacionMin !== undefined) {
    etiquetas.push({
      id: "calificacion",
      texto: `${calificacion(filtros.calificacionMin)} o más`,
      limpiar: { calificacionMin: undefined },
    });
  }

  if (filtros.soloVerificados) {
    etiquetas.push({
      id: "verificados",
      texto: "Solo verificados",
      limpiar: { soloVerificados: undefined },
    });
  }

  if (etiquetas.length === 0) return null;

  function quitar(ids: Set<React.Key>) {
    const limpieza = etiquetas
      .filter((etiqueta) => ids.has(etiqueta.id))
      .reduce<Partial<FiltrosTutor>>((acumulado, etiqueta) => ({ ...acumulado, ...etiqueta.limpiar }), {});

    router.replace(`${ruta}${aQuery({ ...filtros, ...limpieza, pagina: 1 })}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TagGroup aria-label="Filtros aplicados" onRemove={quitar}>
        <TagGroup.List items={etiquetas} className="flex flex-wrap gap-2">
          {(etiqueta: Etiqueta) => (
            <Tag id={etiqueta.id} textValue={etiqueta.texto}>
              {etiqueta.texto}
              <Tag.RemoveButton aria-label={`Quitar el filtro ${etiqueta.texto}`} />
            </Tag>
          )}
        </TagGroup.List>
      </TagGroup>

      <Button
        variant="ghost"
        size="sm"
        onPress={() =>
          router.replace(
            `${ruta}${aQuery({ orden: filtros.orden, pagina: 1, porPagina: filtros.porPagina })}`,
            { scroll: false },
          )
        }
      >
        Limpiar todo
      </Button>
    </div>
  );
}
