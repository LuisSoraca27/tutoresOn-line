import { Suspense } from "react";
import type { Metadata } from "next";
import { CajonFiltros } from "@/components/tutores/cajon-filtros";
import { EsqueletoResultados } from "@/components/tutores/esqueleto-resultados";
import { FiltrosActivos } from "@/components/tutores/filtros-activos";
import { PanelFiltros } from "@/components/tutores/panel-filtros";
import { ResultadosBusqueda } from "@/components/tutores/resultados-busqueda";
import { SelectorOrden } from "@/components/tutores/selector-orden";
import { catalogosRepo } from "@/features/catalogos";
import { leerFiltros, type ParametrosBusqueda } from "@/features/tutores/filtros-url";

export const metadata: Metadata = {
  title: "Buscar tutores",
  description: "Filtra tutores por materia, nivel educativo, modalidad, ciudad, precio y calificación.",
};

export default async function PaginaBusqueda({
  searchParams,
}: {
  searchParams: Promise<ParametrosBusqueda>;
}) {
  const parametros = await searchParams;
  const filtros = leerFiltros(parametros);

  const [materias, niveles, ciudades] = await Promise.all([
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
    catalogosRepo.ciudades(),
  ]);

  // Cambia con cada filtro, así Suspense vuelve a mostrar el esqueleto
  // en lugar de dejar los resultados anteriores congelados.
  const clave = JSON.stringify(filtros);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6">
      <h1 className="titulo text-3xl">Buscar tutores</h1>
      <p className="mt-1.5 text-sm text-[var(--muted)]">
        Filtra por materia, nivel, modalidad y presupuesto. Los resultados se guardan en la
        dirección, así que puedes compartir esta búsqueda tal como la ves.
      </p>

      <div className="mt-8 flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <PanelFiltros
              filtros={filtros}
              materias={materias}
              niveles={niveles}
              ciudades={ciudades}
            />
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <CajonFiltros
              filtros={filtros}
              materias={materias}
              niveles={niveles}
              ciudades={ciudades}
            />
            <div className="ml-auto">
              <SelectorOrden filtros={filtros} />
            </div>
          </div>

          <div className="pb-5">
            <FiltrosActivos
              filtros={filtros}
              materias={materias}
              niveles={niveles}
              ciudades={ciudades}
            />
          </div>

          <Suspense key={clave} fallback={<EsqueletoResultados />}>
            <ResultadosBusqueda filtros={filtros} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
