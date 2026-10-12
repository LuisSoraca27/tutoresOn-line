import { Card, Skeleton } from "@heroui/react";

/**
 * Esqueleto de carga de los resultados (F2.13). Copia la estructura real
 * de la tarjeta para que la página no salte cuando llegan los datos.
 */
export function EsqueletoResultados({ cantidad = 9 }: { cantidad?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Cargando tutores"
    >
      {Array.from({ length: cantidad }, (_, indice) => (
        <Card key={indice}>
          <Card.Header className="flex flex-row items-start gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </Card.Header>
          <Card.Content className="space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-4/5 rounded" />
          </Card.Content>
          <Card.Footer className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </Card.Footer>
        </Card>
      ))}
    </div>
  );
}
