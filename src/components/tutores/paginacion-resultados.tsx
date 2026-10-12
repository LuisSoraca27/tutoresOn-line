"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pagination } from "@heroui/react";
import type { FiltrosTutor } from "@/features/tutores";
import { aQuery } from "@/features/tutores/filtros-url";

/**
 * Paginación de resultados (F2.12).
 *
 * Cada página es un enlace real, no un botón: así se puede abrir en otra
 * pestaña, se indexa y funciona sin JavaScript.
 */
export function PaginacionResultados({
  filtros,
  total,
  porPagina,
}: {
  filtros: FiltrosTutor;
  total: number;
  porPagina: number;
}) {
  const ruta = usePathname();
  const paginas = Math.ceil(total / porPagina);
  const actual = filtros.pagina ?? 1;

  if (paginas <= 1) return null;

  const enlace = (pagina: number) => `${ruta}${aQuery({ ...filtros, pagina })}`;
  const numeros = ventana(actual, paginas);

  return (
    <Pagination className="pt-8">
      <Pagination.Summary>
        Página {actual} de {paginas}
      </Pagination.Summary>

      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous isDisabled={actual === 1}>
            <Link href={enlace(actual - 1)} aria-label="Página anterior" scroll={false}>
              <Pagination.PreviousIcon />
            </Link>
          </Pagination.Previous>
        </Pagination.Item>

        {numeros.map((numero, indice) =>
          numero === null ? (
            <Pagination.Item key={`salto-${indice}`}>
              <Pagination.Ellipsis />
            </Pagination.Item>
          ) : (
            <Pagination.Item key={numero}>
              <Pagination.Link isActive={numero === actual}>
                <Link
                  href={enlace(numero)}
                  scroll={false}
                  aria-label={`Página ${numero}`}
                  aria-current={numero === actual ? "page" : undefined}
                >
                  {numero}
                </Link>
              </Pagination.Link>
            </Pagination.Item>
          ),
        )}

        <Pagination.Item>
          <Pagination.Next isDisabled={actual === paginas}>
            <Link href={enlace(actual + 1)} aria-label="Página siguiente" scroll={false}>
              <Pagination.NextIcon />
            </Link>
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}

/** Primera, última, la actual y sus vecinas; `null` marca los saltos. */
function ventana(actual: number, paginas: number): (number | null)[] {
  if (paginas <= 7) return Array.from({ length: paginas }, (_, i) => i + 1);

  const visibles = new Set([1, paginas, actual, actual - 1, actual + 1]);
  const ordenadas = [...visibles].filter((n) => n >= 1 && n <= paginas).sort((a, b) => a - b);

  return ordenadas.flatMap((numero, indice) =>
    indice > 0 && numero - ordenadas[indice - 1] > 1 ? [null, numero] : [numero],
  );
}
